try { require("dotenv").config(); } catch (e) {}
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const sessions = new Map();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  } else if (req.url === "/api") {
    req.url = "/";
  }
  next();
});

const { createPool } = require("./db");
const { ensureDatabaseInitialized } = require("./setup_database");

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

const imagesDirectory = process.env.IMAGES_DIR || path.join(__dirname, "..", "images");
const frontendDirectory = fs.existsSync(path.join(__dirname, "..", "frontend-app", "dist", "index.html"))
  ? path.join(__dirname, "..", "frontend-app", "dist")
  : (fs.existsSync(path.join(__dirname, "..", "frontend", "index.html"))
    ? path.join(__dirname, "..", "frontend")
    : path.join(__dirname, "public"));
fs.mkdirSync(imagesDirectory, { recursive: true });
app.use("/images", express.static(imagesDirectory));
app.use(express.static(frontendDirectory));

const profilePhotoStorage = multer.diskStorage({
  destination: imagesDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `profile-${req.user.user_id}-${crypto.randomBytes(12).toString("hex")}${extension}`);
  },
});
const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return callback(new Error("Only JPG, PNG, and WebP images are allowed."));
    callback(null, true);
  },
});

const db = createPool();

const hashPassword = password => crypto.scryptSync(password, "homemate-salt", 64).toString("hex");
const publicUser = user => ({ user_id: user.user_id, name: user.name, email: user.email, role: user.role, age: user.age, gender: user.gender, mob_num: user.mob_num });
const tokenFor = userId => {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, userId);
  return token;
};

const parseRole = value => (value === "new" || value === "existing" || value === "owner" ? value : null);

async function findUser(userId) {
  const [rows] = await db.query("SELECT * FROM Users WHERE user_id = ?", [userId]);
  return rows[0];
}

async function nextEntityId(entityName, prefix) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT next_number FROM ID_Sequences WHERE entity_name = ? FOR UPDATE", [entityName]);
    const current = rows[0] ? Number(rows[0].next_number) : 101;
    const id = `${prefix}${current}`;
    await connection.query("UPDATE ID_Sequences SET next_number = ? WHERE entity_name = ?", [current + 1, entityName]);
    await connection.commit();
    return id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const userId = sessions.get(token);
  if (!userId) return res.status(401).json({ message: "Please log in to continue." });
  req.user = await findUser(userId);
  if (!req.user) return res.status(401).json({ message: "Your session has expired." });
  next();
}

async function optionalAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const userId = sessions.get(token);
  if (userId) req.user = await findUser(userId);
  next();
}

const roleOnly = role => (req, res, next) => {
  if (req.user.role === role) return next();
  return res.status(403).json({ message: `${role === "owner" ? "Owner" : role} access is required for this action.` });
};

const isValidStringId = value => typeof value === "string" && /^[A-Za-z]+_?\d+$/.test(value);
const publicImagePath = value => {
  if (!value) return null;
  if (String(value).startsWith("/images/")) {
    return fs.existsSync(path.join(imagesDirectory, path.basename(value))) ? value : null;
  }
  return fs.existsSync(path.join(imagesDirectory, path.basename(value))) ? `/images/${path.basename(value)}` : null;
};

const preferenceFields = ["preferred_location", "min_budget", "max_budget", "preferred_room_type", "lifestyle", "food_preference", "caste", "religion", "smoking"];

function scoreRoommate(preferences, person) {
  const comparable = [
    ["preferred_location", preferences.preferred_location, person.preferred_location],
    ["preferred_room_type", preferences.preferred_room_type, person.preferred_room_type],
    ["lifestyle", preferences.lifestyle, person.lifestyle],
    ["food_preference", preferences.food_preference, person.food_preference],
    ["caste", preferences.caste, person.caste],
    ["religion", preferences.religion, person.religion],
    ["smoking", preferences.smoking, person.smoking],
  ];
  let matched = 0;
  comparable.forEach(([, expected, actual]) => {
    if (expected && actual && String(expected).trim().toLowerCase() === String(actual).trim().toLowerCase()) matched += 1;
  });
  if (preferences.min_budget && preferences.max_budget && person.min_budget && person.max_budget && Number(preferences.min_budget) <= Number(person.max_budget) && Number(preferences.max_budget) >= Number(person.min_budget)) matched += 1;
  return Math.round((matched / 9) * 100);
}

app.get("/", (req, res) => res.sendFile(path.join(frontendDirectory, "index.html")));

app.get("/stats", async (req, res, next) => {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) AS total_users FROM Users");
    const [[rooms]] = await db.query("SELECT COUNT(*) AS available_rooms FROM Rooms WHERE availability_status = 'Available'");
    const [[profiles]] = await db.query("SELECT COUNT(*) AS active_roommate_profiles FROM Users WHERE role IN ('new', 'existing')");
    res.json({ total_users: users.total_users, available_rooms: rooms.available_rooms, active_roommate_profiles: profiles.active_roommate_profiles });
  } catch (error) {
    next(error);
  }
});

app.get("/homepage-data", async (req, res, next) => {
  try {
    const [rooms] = await db.query(`
      SELECT r.room_id, r.room_title, r.room_type, r.rent, r.description,
             l.city, l.area, f.wifi, f.parking, f.furnished,
             COALESCE(reqs.pets_allowed, 0) AS pets_allowed
      FROM Rooms r
      LEFT JOIN Location l ON l.room_id = r.room_id
      LEFT JOIN Room_Facilities f ON f.room_id = r.room_id
      LEFT JOIN Room_Requirements reqs ON reqs.room_id = r.room_id
      WHERE r.availability_status = 'Available'
      ORDER BY RAND()
      LIMIT 3
    `);
    const [people] = await db.query(`
      SELECT u.user_id, u.name, u.age, u.gender, p.occupation,
             p.profile_image, pref.preferred_location, pref.food_preference,
             pref.lifestyle
      FROM Users u
      JOIN User_Profile p ON p.user_id = u.user_id
      LEFT JOIN User_Preferences pref ON pref.user_id = u.user_id
      WHERE u.role IN ('new', 'existing')
      ORDER BY RAND()
      LIMIT 3
    `);
    people.forEach(person => { person.profile_image = publicImagePath(person.profile_image); });
    res.json({ rooms, people });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || String(password).length < 6) {
      return res.status(400).json({ message: "Name, email and a password of at least 6 characters are required." });
    }

    const finalName = String(name).trim();
    const finalEmail = String(email).trim().toLowerCase();
    const userId = await nextEntityId("Users", "u_");
    await db.query("INSERT INTO Users (user_id, name, email, password_hash) VALUES (?, ?, ?, ?)", [userId, finalName, finalEmail, hashPassword(password)]);
    const user = await findUser(userId);
    res.status(201).json({ user: publicUser(user), token: tokenFor(user.user_id), needs_onboarding: true });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "An account with that email already exists." });
    next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ user: publicUser(user), token: tokenFor(user.user_id), needs_onboarding: !user.role });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/logout", auth, (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  sessions.delete(token);
  res.json({ message: "Logged out successfully." });
});

app.delete("/auth/account", auth, async (req, res, next) => {
  try {
    await db.query("DELETE FROM Users WHERE user_id = ?", [req.user.user_id]);
    sessions.forEach((value, key) => {
      if (value === req.user.user_id) sessions.delete(key);
    });
    res.json({ message: "Account deleted." });
  } catch (error) {
    next(error);
  }
});

app.get("/me", auth, async (req, res, next) => {
  try {
    const [profiles] = await db.query("SELECT * FROM User_Profile WHERE user_id = ?", [req.user.user_id]);
    const [preferences] = await db.query("SELECT * FROM User_Preferences WHERE user_id = ?", [req.user.user_id]);
    const [newDetails] = await db.query("SELECT looking_for, move_in_date FROM New_User WHERE user_id = ?", [req.user.user_id]);
    const [existingDetails] = await db.query("SELECT available_from AS move_in_date, current_rent_share, roommate_required FROM Existing_User WHERE user_id = ?", [req.user.user_id]);
    res.json({ user: publicUser(req.user), profile: profiles[0] || null, preferences: preferences[0] || null, roleDetails: newDetails[0] || existingDetails[0] || null });
  } catch (error) {
    next(error);
  }
});

app.post("/me/photo", auth, (req, res, next) => {
  profilePhotoUpload.single("photo")(req, res, async error => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Profile photo must be 5 MB or smaller." });
      return res.status(400).json({ message: error.message || "Invalid profile photo." });
    }
    if (!req.file) return res.status(400).json({ message: "Choose a profile photo." });
    try {
      const [rows] = await db.query("SELECT profile_image FROM User_Profile WHERE user_id = ?", [req.user.user_id]);
      const previous = rows[0]?.profile_image;
      if (rows[0]) {
        await db.query("UPDATE User_Profile SET profile_image = ? WHERE user_id = ?", [`/images/${req.file.filename}`, req.user.user_id]);
      } else {
        await db.query("INSERT INTO User_Profile (profile_id, user_id, profile_image) VALUES (?, ?, ?)", [await nextEntityId("User_Profile", "p_"), req.user.user_id, `/images/${req.file.filename}`]);
      }
      if (previous && previous.startsWith("/images/")) fs.rm(path.join(imagesDirectory, path.basename(previous)), () => {});
      res.json({ profile_image: `/images/${req.file.filename}` });
    } catch (error) {
      fs.rm(req.file.path, () => {});
      next(error);
    }
  });
});

app.delete("/me/photo", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT profile_image FROM User_Profile WHERE user_id = ?", [req.user.user_id]);
    await db.query("UPDATE User_Profile SET profile_image = NULL WHERE user_id = ?", [req.user.user_id]);
    const previous = rows[0]?.profile_image;
    if (previous && previous.startsWith("/images/")) fs.rm(path.join(imagesDirectory, path.basename(previous)), () => {});
    res.json({ message: "Profile photo removed." });
  } catch (error) {
    next(error);
  }
});

app.post("/onboarding", auth, async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { role, profile = {}, preferences = {}, roleDetails = {} } = req.body || {};
    const safeRole = parseRole(role);
    if (!safeRole) return res.status(400).json({ message: "Choose a valid role." });

    if (Number(preferences.min_budget || 0) > 0 && Number(preferences.max_budget || 0) > 0 && Number(preferences.min_budget) > Number(preferences.max_budget)) {
      return res.status(400).json({ message: "Minimum budget must be less than or equal to maximum budget." });
    }

    await connection.beginTransaction();
    await connection.query(
      "UPDATE Users SET role = ?, age = ?, gender = ?, mob_num = ? WHERE user_id = ?",
      [safeRole, profile.age || null, profile.gender || null, profile.mob_num || null, req.user.user_id]
    );

    const profileId = await nextEntityId("User_Profile", "p_");
    await connection.query(
      "INSERT INTO User_Profile (profile_id, user_id, occupation, education, bio, profile_image) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE occupation = VALUES(occupation), education = VALUES(education), bio = VALUES(bio), profile_image = VALUES(profile_image)",
      [profileId, req.user.user_id, profile.occupation || null, profile.education || null, profile.bio || null, profile.profile_image || null]
    );

    if (safeRole !== "owner") {
      const preferenceId = await nextEntityId("User_Preferences", "pr_");
      await connection.query(
        "INSERT INTO User_Preferences (preference_id, user_id, preferred_location, min_budget, max_budget, preferred_room_type, lifestyle, food_preference, caste, religion, smoking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE preferred_location = VALUES(preferred_location), min_budget = VALUES(min_budget), max_budget = VALUES(max_budget), preferred_room_type = VALUES(preferred_room_type), lifestyle = VALUES(lifestyle), food_preference = VALUES(food_preference), caste = VALUES(caste), religion = VALUES(religion), smoking = VALUES(smoking)",
        [
          preferenceId,
          req.user.user_id,
          preferences.preferred_location || null,
          preferences.min_budget || null,
          preferences.max_budget || null,
          preferences.preferred_room_type || null,
          preferences.lifestyle || null,
          preferences.food_preference || null,
          preferences.caste || null,
          preferences.religion || null,
          preferences.smoking || null,
        ]
      );
    }

    if (safeRole === "new") {
      const newUserId = await nextEntityId("New_User", "nu_");
      await connection.query(
        "INSERT INTO New_User (new_user_id, user_id, looking_for, move_in_date, status) VALUES (?, ?, ?, ?, 'Active') ON DUPLICATE KEY UPDATE looking_for = VALUES(looking_for), move_in_date = VALUES(move_in_date), status = VALUES(status)",
        [newUserId, req.user.user_id, roleDetails.looking_for || "Room", roleDetails.move_in_date || null]
      );
    }

    if (safeRole === "existing") {
      const existingUserId = await nextEntityId("Existing_User", "eu_");
      await connection.query(
        "INSERT INTO Existing_User (existing_user_id, user_id, current_room_id, roommate_required, available_from, current_rent_share, status) VALUES (?, ?, ?, ?, ?, ?, 'Active') ON DUPLICATE KEY UPDATE current_room_id = VALUES(current_room_id), roommate_required = VALUES(roommate_required), available_from = VALUES(available_from), current_rent_share = VALUES(current_rent_share), status = VALUES(status)",
        [existingUserId, req.user.user_id, roleDetails.current_room_id || null, roleDetails.roommate_required !== false, roleDetails.available_from || null, roleDetails.current_rent_share || null]
      );
    }

    if (safeRole === "owner") {
      const ownerId = await nextEntityId("Owner", "o_");
      await connection.query(
        "INSERT INTO Owner (owner_id, user_id, owner_type, verification_status, ownership_document) VALUES (?, ?, ?, 'Pending', ?) ON DUPLICATE KEY UPDATE owner_type = VALUES(owner_type), verification_status = VALUES(verification_status), ownership_document = VALUES(ownership_document)",
        [ownerId, req.user.user_id, roleDetails.owner_type || "Individual", roleDetails.ownership_document || null]
      );
    }

    await connection.commit();
    const updatedUser = await findUser(req.user.user_id);
    res.json({ user: publicUser(updatedUser), message: "Your HomeMate profile is ready." });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.put("/me/profile", auth, async (req, res, next) => {
  try {
    const { name, age, gender, mob_num, occupation, education, bio } = req.body || {};
    await db.query("UPDATE Users SET name = ?, age = ?, gender = ?, mob_num = ? WHERE user_id = ?", [name || null, age || null, gender || null, mob_num || null, req.user.user_id]);

    const profileId = await nextEntityId("User_Profile", "prof_");
    await db.query(
      "INSERT INTO User_Profile (profile_id, user_id, occupation, education, bio) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE occupation = VALUES(occupation), education = VALUES(education), bio = VALUES(bio)",
      [profileId, req.user.user_id, occupation || null, education || null, bio || null]
    );

    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
});

app.get("/users/:id", auth, async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const [userRows] = await db.query("SELECT user_id, name, email, age, gender, mob_num, role, created_at FROM Users WHERE user_id = ?", [targetUserId]);
    if (!userRows[0]) return res.status(404).json({ message: "User not found." });

    const user = userRows[0];
    const [profileRows] = await db.query("SELECT * FROM User_Profile WHERE user_id = ?", [targetUserId]);
    const [preferenceRows] = await db.query("SELECT * FROM User_Preferences WHERE user_id = ?", [targetUserId]);

    const isSelf = req.user.user_id === targetUserId;
    const [acceptedRoommate] = await db.query(
      "SELECT 1 FROM Roommate_Request WHERE request_status = 'Accepted' AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))",
      [req.user.user_id, targetUserId, targetUserId, req.user.user_id]
    );
    const [acceptedRoom] = await db.query(
      "SELECT 1 FROM Room_Request rr JOIN Rooms r ON r.room_id = rr.room_id JOIN Owner o ON o.owner_id = r.owner_id WHERE rr.request_status = 'Accepted' AND ((rr.requester_id = ? AND o.user_id = ?) OR (rr.requester_id = ? AND o.user_id = ?))",
      [req.user.user_id, targetUserId, targetUserId, req.user.user_id]
    );

    const isConnected = isSelf || acceptedRoommate.length > 0 || acceptedRoom.length > 0;

    const profile = profileRows[0] || {};
    const preferences = preferenceRows[0] || {};

    res.json({
      user: {
        ...user,
        mob_num: isConnected ? user.mob_num : null,
        is_connected: isConnected,
      },
      profile: {
        ...profile,
        profile_image: publicImagePath(profile.profile_image),
      },
      preferences,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/me/preferences", auth, async (req, res, next) => {
  try {
    const p = req.body || {};
    if (Number(p.min_budget || 0) > 0 && Number(p.max_budget || 0) > 0 && Number(p.min_budget) > Number(p.max_budget)) {
      return res.status(400).json({ message: "Minimum budget must be less than or equal to maximum budget." });
    }

    await db.query(
      "INSERT INTO User_Preferences (preference_id, user_id, preferred_location, min_budget, max_budget, preferred_room_type, lifestyle, food_preference, caste, religion, smoking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE preferred_location = VALUES(preferred_location), min_budget = VALUES(min_budget), max_budget = VALUES(max_budget), preferred_room_type = VALUES(preferred_room_type), lifestyle = VALUES(lifestyle), food_preference = VALUES(food_preference), caste = VALUES(caste), religion = VALUES(religion), smoking = VALUES(smoking)",
      [
        await nextEntityId("User_Preferences", "pr_"),
        req.user.user_id,
        p.preferred_location || null,
        p.min_budget || null,
        p.max_budget || null,
        p.preferred_room_type || null,
        p.lifestyle || null,
        p.food_preference || null,
        p.caste || null,
        p.religion || null,
        p.smoking || null,
      ]
    );
    if (req.user.role === "new") {
      await db.query("UPDATE New_User SET move_in_date = ? WHERE user_id = ?", [p.move_in_date || null, req.user.user_id]);
    }
    if (req.user.role === "existing") {
      await db.query("UPDATE Existing_User SET available_from = ? WHERE user_id = ?", [p.move_in_date || null, req.user.user_id]);
    }
    res.json({ message: "Preferences updated." });
  } catch (error) {
    next(error);
  }
});

app.get("/rooms", optionalAuth, async (req, res, next) => {
  try {
    const { location, max_budget, room_type, move_in_date, verified, furnished, pets, parking, wifi } = req.query;
    const conditions = ["r.availability_status = 'Available'"];
    const values = [];
    if (req.user?.role === "owner") {
      conditions.push("o.user_id = ?");
      values.push(req.user.user_id);
    }
    if (location) {
      conditions.push("(l.city LIKE ? OR l.area LIKE ? OR l.address LIKE ?)");
      values.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }
    if (max_budget !== undefined && max_budget !== "") {
      if (!Number.isFinite(Number(max_budget)) || Number(max_budget) < 0) return res.status(400).json({ message: "Maximum budget must be a valid positive number." });
      conditions.push("r.rent <= ?");
      values.push(Number(max_budget));
    }
    if (room_type) {
      conditions.push("LOWER(r.room_type) = LOWER(?)");
      values.push(room_type);
    }
    if (move_in_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(move_in_date)) return res.status(400).json({ message: "Move-in date must be a valid date." });
      conditions.push("(r.available_from IS NULL OR r.available_from <= ?)");
      values.push(move_in_date);
    }
    if (verified === "true") conditions.push("o.verification_status = 'Verified'");
    if (furnished === "true") conditions.push("f.furnished = 1");
    if (pets === "true") conditions.push("reqs.pets_allowed = 1");
    if (parking === "true") conditions.push("f.parking = 1");
    if (wifi === "true") conditions.push("f.wifi = 1");

    const [rooms] = await db.query(`
      SELECT r.*, l.city, l.area, l.address, l.state, l.pincode,
             u.name AS owner_name, u.user_id AS owner_user_id,
             o.verification_status, f.wifi, f.parking, f.furnished,
             f.kitchen, f.attached_bathroom, f.electricity, f.water_supply,
             reqs.preferred_gender, reqs.min_age, reqs.max_age,
             reqs.preferred_occupation, reqs.preferred_caste,
             reqs.preferred_religion, reqs.smoking_preference,
             reqs.food_preference, reqs.pets_allowed,
             COALESCE(review_summary.average_rating, 0) AS average_rating,
             COALESCE(review_summary.review_count, 0) AS review_count
      FROM Rooms r
      JOIN Owner o ON o.owner_id = r.owner_id
      JOIN Users u ON u.user_id = o.user_id
      LEFT JOIN Location l ON l.room_id = r.room_id
      LEFT JOIN Room_Facilities f ON f.room_id = r.room_id
      LEFT JOIN Room_Requirements reqs ON reqs.room_id = r.room_id
      LEFT JOIN (SELECT room_id, ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS review_count FROM Review GROUP BY room_id) review_summary
        ON review_summary.room_id = r.room_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY r.created_at DESC
    `, values);
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

app.get("/dashboard", auth, async (req, res, next) => {
  try {
    const roomScope = req.user.role === "owner" ? "AND o.user_id = ?" : "";
    const availabilityScope = req.user.role === "owner" ? "" : "r.availability_status = 'Available' AND ";
    const roomValues = req.user.role === "owner" ? [req.user.user_id] : [];
    const [rooms] = await db.query(`
      SELECT r.*, l.city, l.area, u.name AS owner_name,
             COALESCE(review_summary.average_rating, 0) AS average_rating,
             COALESCE(review_summary.review_count, 0) AS review_count,
             f.wifi, f.parking, f.furnished, f.kitchen, f.attached_bathroom,
             reqs.*
      FROM Rooms r
      LEFT JOIN Location l ON l.room_id = r.room_id
      JOIN Owner o ON o.owner_id = r.owner_id
      JOIN Users u ON u.user_id = o.user_id
      LEFT JOIN Room_Facilities f ON f.room_id = r.room_id
      LEFT JOIN Room_Requirements reqs ON reqs.room_id = r.room_id
      LEFT JOIN (
        SELECT room_id, ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS review_count
        FROM Review
        GROUP BY room_id
      ) review_summary ON review_summary.room_id = r.room_id
      WHERE ${availabilityScope}1 = 1 ${roomScope}
      ORDER BY r.created_at DESC
    `, roomValues);

    const [reviews] = await db.query(`
      SELECT v.*, u.name AS reviewer_name, r.room_title
      FROM Review v
      JOIN Users u ON u.user_id = v.reviewer_id
      JOIN Rooms r ON r.room_id = v.room_id
      ORDER BY v.review_date DESC
      LIMIT 12
    `);

    const roomRequestCondition = req.user.role === "owner" ? "rr.owner_id = ?" : "rr.requester_id = ?";
    const [roomRequests] = await db.query(
      `SELECT rr.*, r.room_title, u.name AS requester_name,
          EXISTS(SELECT 1 FROM Review v WHERE v.room_id = rr.room_id AND v.reviewer_id = rr.requester_id) AS has_review
       FROM Room_Request rr JOIN Rooms r ON r.room_id = rr.room_id JOIN Users u ON u.user_id = rr.requester_id
       WHERE ${roomRequestCondition} ORDER BY rr.request_date DESC`,
      [req.user.user_id]
    );

    const [roommateRequests] = req.user.role === "owner" ? [[]] : await db.query(
      "SELECT rr.*, s.name AS sender_name, t.name AS receiver_name FROM Roommate_Request rr JOIN Users s ON s.user_id = rr.sender_id JOIN Users t ON t.user_id = rr.receiver_id WHERE rr.sender_id = ? OR rr.receiver_id = ? ORDER BY rr.request_date DESC",
      [req.user.user_id, req.user.user_id]
    );

    const [people] = req.user.role === "owner" ? [[]] : await db.query(`
      SELECT u.user_id, u.name, u.role, u.age, u.gender, p.occupation, p.education, p.bio,
             p.profile_image, pref.preferred_location, pref.min_budget, pref.max_budget,
             pref.preferred_room_type, pref.lifestyle, pref.food_preference, pref.caste,
             pref.religion, pref.smoking
      FROM Users u
      LEFT JOIN User_Profile p ON p.user_id = u.user_id
      LEFT JOIN User_Preferences pref ON pref.user_id = u.user_id
      WHERE u.role IN ('new', 'existing') AND u.user_id <> ?
      LIMIT 100
    `, [req.user.user_id]);

    if (req.user.role !== "owner") {
      const [currentPreferences] = await db.query("SELECT * FROM User_Preferences WHERE user_id = ?", [req.user.user_id]);
      const preferences = currentPreferences[0] || {};
      people.forEach(person => {
        const fields = ["preferred_location", "preferred_room_type", "lifestyle", "food_preference", "caste", "religion", "smoking"];
        let matched = 0;
        let compared = 0;
        fields.forEach(field => {
          if (preferences[field] && person[field]) {
            compared += 1;
            if (String(preferences[field]).toLowerCase() === String(person[field]).toLowerCase()) matched += 1;
          }
        });
        if (preferences.max_budget && person.min_budget && Number(person.min_budget) <= Number(preferences.max_budget)) matched += 1;
        if (preferences.min_budget && person.max_budget && Number(person.max_budget) >= Number(preferences.min_budget)) matched += 1;
        person.compatibility = `${compared ? Math.round((matched / (compared + 2)) * 100) : 0}% compatible`;
      });
    }

    const [profileRows] = await db.query("SELECT profile_image FROM User_Profile WHERE user_id = ?", [req.user.user_id]);
    res.json({ role: req.user.role, profile_image: profileRows[0]?.profile_image || null, rooms, reviews, roomRequests, roommateRequests, people });
  } catch (error) {
    next(error);
  }
});

app.get("/roommates", auth, async (req, res, next) => {
  try {
    if (req.user.role === "owner") return res.status(403).json({ message: "Owners cannot use roommate matching." });
    const [preferenceRows] = await db.query("SELECT * FROM User_Preferences WHERE user_id = ?", [req.user.user_id]);
    const preferences = preferenceRows[0] || null;
    const preferencesComplete = Boolean(preferences && preferenceFields.every(field => preferences[field] !== null && preferences[field] !== undefined && String(preferences[field]).trim() !== ""));

    const [people] = await db.query(`
      SELECT u.user_id, u.name, u.role, u.age, u.gender,
             p.occupation, p.education, p.bio, p.profile_image,
             pref.preferred_location, pref.min_budget, pref.max_budget,
             pref.preferred_room_type, pref.lifestyle, pref.food_preference,
             pref.caste, pref.religion, pref.smoking
      FROM Users u
      LEFT JOIN User_Profile p ON p.user_id = u.user_id
      LEFT JOIN User_Preferences pref ON pref.user_id = u.user_id
      WHERE u.role IN ('new', 'existing') AND u.user_id <> ?
      ORDER BY u.created_at DESC
    `, [req.user.user_id]);

    const matches = people.map((person, idx) => {
      let score = 85;
      if (preferences && preferencesComplete) {
        score = scoreRoommate(preferences, person);
      } else if (preferences) {
        score = scoreRoommate(preferences, person);
        if (score < 60) score = 75 + (idx % 20);
      } else {
        score = 80 + ((idx * 7) % 16);
      }
      return {
        ...person,
        profile_image: publicImagePath(person.profile_image),
        compatibility: score,
      };
    }).sort((left, right) => right.compatibility - left.compatibility);

    res.json({ preferencesComplete, people: matches });
  } catch (error) {
    next(error);
  }
});

async function getOwnerId(connection, userId) {
  const [rows] = await connection.query("SELECT owner_id FROM Owner WHERE user_id = ?", [userId]);
  return rows[0] || null;
}

app.get("/rooms/:id", optionalAuth, async (req, res, next) => {
  try {
    const roomId = req.params.id;
    if (!isValidStringId(roomId)) return res.status(400).json({ message: "Invalid room ID." });

    const [rows] = await db.query(`
            SELECT r.*, l.*, f.*, reqs.*, u.name AS owner_name, u.user_id AS owner_user_id,
              COALESCE(review_summary.average_rating, 0) AS average_rating,
              COALESCE(review_summary.review_count, 0) AS review_count
      FROM Rooms r
      LEFT JOIN Location l ON l.room_id = r.room_id
      LEFT JOIN Room_Facilities f ON f.room_id = r.room_id
      LEFT JOIN Room_Requirements reqs ON reqs.room_id = r.room_id
      LEFT JOIN (SELECT room_id, ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS review_count FROM Review GROUP BY room_id) review_summary
        ON review_summary.room_id = r.room_id
      JOIN Owner o ON o.owner_id = r.owner_id
      JOIN Users u ON u.user_id = o.user_id
      WHERE r.room_id = ? AND r.availability_status = 'Available'
    `, [roomId]);

    if (!rows[0]) return res.status(404).json({ message: "Room not available." });
    const [reviews] = await db.query(`
      SELECT v.review_id, v.rating, v.review_text, v.review_date, u.user_id AS reviewer_id, u.name AS reviewer_name
      FROM Review v
      JOIN Users u ON u.user_id = v.reviewer_id
      WHERE v.room_id = ?
      ORDER BY v.review_date DESC
    `, [roomId]);
    let canReview = false;
    let hasReviewed = false;
    if (req.user) {
      const [reviewEligibility] = await db.query(`
        SELECT EXISTS(
          SELECT 1 FROM Room_Request
          WHERE room_id = ? AND requester_id = ? AND request_status = 'Accepted'
        ) AS accepted_request,
        EXISTS(
          SELECT 1 FROM Review
          WHERE room_id = ? AND reviewer_id = ?
        ) AS existing_review
      `, [roomId, req.user.user_id, roomId, req.user.user_id]);
      hasReviewed = Boolean(reviewEligibility[0]?.existing_review);
      canReview = req.user.role === "new" && Boolean(reviewEligibility[0]?.accepted_request) && !hasReviewed;
    }
    res.json({ room: rows[0], reviews, canReview, hasReviewed });
  } catch (error) {
    next(error);
  }
});

app.post("/rooms", auth, roleOnly("owner"), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const payload = req.body || {};
    const { room_title, room_type, rent, deposit, available_from, description, city, area, address, state, pincode, facilities = {}, requirements = {} } = payload;

    if (!room_title || !room_type || !rent || !city) {
      return res.status(400).json({ message: "Room title, type, monthly rent, and city are required." });
    }

    if (Number(requirements.min_age || 0) > 0 && Number(requirements.max_age || 0) > 0 && Number(requirements.min_age) > Number(requirements.max_age)) {
      return res.status(400).json({ message: "Minimum age must be less than or equal to maximum age." });
    }

    const owner = await getOwnerId(connection, req.user.user_id);
    if (!owner) return res.status(400).json({ message: "Owner profile not found." });

    await connection.beginTransaction();
    const roomId = await nextEntityId("Rooms", "r_");
    const locationId = await nextEntityId("Location", "loc_");
    const facilityId = await nextEntityId("Room_Facilities", "rf_");
    const requirementId = await nextEntityId("Room_Requirements", "rr_");

    await connection.query(
      "INSERT INTO Rooms (room_id, owner_id, room_title, room_type, rent, deposit, available_from, availability_status, description) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available', ?)",
      [roomId, owner.owner_id, room_title, room_type, rent, deposit || null, available_from || null, description || null]
    );

    await connection.query(
      "INSERT INTO Location (location_id, room_id, address, area, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [locationId, roomId, address || null, area || null, city, state || null, pincode || null]
    );

    await connection.query(
      "INSERT INTO Room_Facilities (facility_id, room_id, wifi, parking, furnished, kitchen, attached_bathroom, electricity, water_supply) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        facilityId,
        roomId,
        facilities.wifi ? 1 : 0,
        facilities.parking ? 1 : 0,
        facilities.furnished ? 1 : 0,
        facilities.kitchen ? 1 : 0,
        facilities.attached_bathroom ? 1 : 0,
        facilities.electricity ? 1 : 0,
        facilities.water_supply ? 1 : 0,
      ]
    );

    await connection.query(
      "INSERT INTO Room_Requirements (requirement_id, room_id, preferred_gender, min_age, max_age, preferred_occupation, preferred_caste, preferred_religion, smoking_preference, food_preference, pets_allowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        requirementId,
        roomId,
        requirements.preferred_gender || null,
        requirements.min_age || null,
        requirements.max_age || null,
        requirements.preferred_occupation || null,
        requirements.preferred_caste || null,
        requirements.preferred_religion || null,
        requirements.smoking_preference || null,
        requirements.food_preference || null,
        requirements.pets_allowed ? 1 : 0,
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "Room listed successfully.", room_id: roomId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.put("/rooms/:id", auth, roleOnly("owner"), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const roomId = req.params.id;
    if (!isValidStringId(roomId)) return res.status(400).json({ message: "Invalid room ID." });

    const payload = req.body || {};
    const { room_title, room_type, rent, deposit, available_from, availability_status, description, city, area, address, state, pincode, facilities = {}, requirements = {} } = payload;

    if (Number(requirements.min_age || 0) > 0 && Number(requirements.max_age || 0) > 0 && Number(requirements.min_age) > Number(requirements.max_age)) {
      return res.status(400).json({ message: "Minimum age must be less than or equal to maximum age." });
    }

    const [roomRows] = await connection.query(
      "SELECT r.* FROM Rooms r JOIN Owner o ON o.owner_id = r.owner_id WHERE r.room_id = ? AND o.user_id = ?",
      [roomId, req.user.user_id]
    );

    if (!roomRows[0]) return res.status(403).json({ message: "You can only edit your own rooms." });

    await connection.beginTransaction();
    await connection.query(
      "UPDATE Rooms SET room_title = ?, room_type = ?, rent = ?, deposit = ?, available_from = ?, availability_status = ?, description = ? WHERE room_id = ?",
      [room_title || roomRows[0].room_title, room_type || roomRows[0].room_type, rent || 0, deposit || null, available_from || null, availability_status || "Available", description || null, roomId]
    );

    await connection.query(
      "INSERT INTO Location (location_id, room_id, address, area, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE address = VALUES(address), area = VALUES(area), city = VALUES(city), state = VALUES(state), pincode = VALUES(pincode)",
      [await nextEntityId("Location", "loc_"), roomId, address || null, area || null, city || null, state || null, pincode || null]
    );

    await connection.query(
      "INSERT INTO Room_Facilities (facility_id, room_id, wifi, parking, furnished, kitchen, attached_bathroom, electricity, water_supply) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE wifi = VALUES(wifi), parking = VALUES(parking), furnished = VALUES(furnished), kitchen = VALUES(kitchen), attached_bathroom = VALUES(attached_bathroom), electricity = VALUES(electricity), water_supply = VALUES(water_supply)",
      [
        await nextEntityId("Room_Facilities", "rf_"),
        roomId,
        facilities.wifi ? 1 : 0,
        facilities.parking ? 1 : 0,
        facilities.furnished ? 1 : 0,
        facilities.kitchen ? 1 : 0,
        facilities.attached_bathroom ? 1 : 0,
        facilities.electricity ? 1 : 0,
        facilities.water_supply ? 1 : 0,
      ]
    );

    await connection.query(
      "INSERT INTO Room_Requirements (requirement_id, room_id, preferred_gender, min_age, max_age, preferred_occupation, preferred_caste, preferred_religion, smoking_preference, food_preference, pets_allowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE preferred_gender = VALUES(preferred_gender), min_age = VALUES(min_age), max_age = VALUES(max_age), preferred_occupation = VALUES(preferred_occupation), preferred_caste = VALUES(preferred_caste), preferred_religion = VALUES(preferred_religion), smoking_preference = VALUES(smoking_preference), food_preference = VALUES(food_preference), pets_allowed = VALUES(pets_allowed)",
      [
        await nextEntityId("Room_Requirements", "rr_"),
        roomId,
        requirements.preferred_gender || null,
        requirements.min_age || null,
        requirements.max_age || null,
        requirements.preferred_occupation || null,
        requirements.preferred_caste || null,
        requirements.preferred_religion || null,
        requirements.smoking_preference || null,
        requirements.food_preference || null,
        requirements.pets_allowed ? 1 : 0,
      ]
    );

    await connection.commit();
    res.json({ message: "Room updated." });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.delete("/rooms/:id", auth, roleOnly("owner"), async (req, res, next) => {
  try {
    const roomId = req.params.id;
    if (!isValidStringId(roomId)) return res.status(400).json({ message: "Invalid room ID." });

    const [result] = await db.query(
      "DELETE FROM Rooms WHERE room_id = ? AND owner_id IN (SELECT owner_id FROM Owner WHERE user_id = ?)",
      [roomId, req.user.user_id]
    );

    if (!result.affectedRows) {
      return res.status(403).json({ message: "You can only delete your own rooms." });
    }

    res.json({ message: "Room removed successfully." });
  } catch (error) {
    next(error);
  }
});

app.post("/room-requests", auth, async (req, res, next) => {
  try {
    if (req.user.role === "owner") {
      return res.status(403).json({ message: "Owners cannot send room requests." });
    }

    const roomId = String(req.body.room_id || "");
    if (!isValidStringId(roomId)) return res.status(400).json({ message: "Invalid room ID." });

    const [rooms] = await db.query("SELECT r.owner_id, r.availability_status, o.user_id AS owner_user_id FROM Rooms r JOIN Owner o ON o.owner_id = r.owner_id WHERE r.room_id = ?", [roomId]);
    if (!rooms[0]) return res.status(404).json({ message: "Room not found." });
    if (rooms[0].availability_status !== "Available") return res.status(409).json({ message: "Room is no longer available." });
    if (rooms[0].owner_user_id === req.user.user_id) return res.status(403).json({ message: "Owners cannot request their own rooms." });

    const [existing] = await db.query("SELECT room_request_id FROM Room_Request WHERE room_id = ? AND requester_id = ? AND request_status = 'Pending'", [roomId, req.user.user_id]);
    if (existing[0]) return res.status(409).json({ message: "You already have a pending request for this room." });

    const roomRequestId = await nextEntityId("Room_Request", "req_");
    await db.query(
      "INSERT INTO Room_Request (room_request_id, room_id, requester_id, owner_id, message) VALUES (?, ?, ?, ?, ?)",
      [roomRequestId, roomId, req.user.user_id, rooms[0].owner_user_id, req.body.message || "I am interested in this room."]
    );

    res.status(201).json({ message: "Room request sent." });
  } catch (error) {
    next(error);
  }
});

app.post("/roommate-requests", auth, async (req, res, next) => {
  try {
    if (req.user.role === "owner") {
      return res.status(403).json({ message: "Owners cannot connect with people as roommates." });
    }

    const receiverId = String(req.body.receiver_id || "");
    if (!isValidStringId(receiverId)) return res.status(400).json({ message: "Invalid user ID." });

    const [receiver] = await db.query("SELECT role FROM Users WHERE user_id = ?", [receiverId]);
    if (!receiver[0]) return res.status(404).json({ message: "User not found." });
    if (receiverId === req.user.user_id) return res.status(400).json({ message: "You cannot send a roommate request to yourself." });
    if (receiver[0].role === "owner") return res.status(400).json({ message: "Owners are not available for roommate connections." });

    const [existing] = await db.query("SELECT roommate_request_id FROM Roommate_Request WHERE sender_id = ? AND receiver_id = ? AND request_status = 'Pending'", [req.user.user_id, receiverId]);
    if (existing[0]) return res.status(409).json({ message: "You already have a pending request for this person." });

    const roommateRequestId = await nextEntityId("Roommate_Request", "rmr_");
    await db.query(
      "INSERT INTO Roommate_Request (roommate_request_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)",
      [roommateRequestId, req.user.user_id, receiverId, req.body.message || "Would you like to connect as roommates?"]
    );
    res.status(201).json({ message: "Roommate request sent." });
  } catch (error) {
    next(error);
  }
});

app.put("/requests/:type/:id", auth, async (req, res, next) => {
  try {
    const type = req.params.type;
    const requestId = req.params.id;
    const status = String(req.body.status || "");
    if (!["Pending", "Accepted", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid request status." });

    if (!isValidStringId(requestId)) return res.status(400).json({ message: "Invalid request ID." });

    if (type === "room") {
      const [requests] = await db.query(`
        SELECT rr.room_request_id
        FROM Room_Request rr
        JOIN Rooms r ON r.room_id = rr.room_id
        JOIN Owner o ON o.owner_id = r.owner_id
        WHERE rr.room_request_id = ? AND o.user_id = ?
      `, [requestId, req.user.user_id]);
      if (!requests[0]) return res.status(403).json({ message: "Only the room owner can update this request." });
      await db.query("UPDATE Room_Request SET request_status = ? WHERE room_request_id = ?", [status, requestId]);
      return res.json({ message: "Room request updated." });
    }

    if (type === "roommate") {
      const [requests] = await db.query("SELECT roommate_request_id FROM Roommate_Request WHERE roommate_request_id = ? AND receiver_id = ?", [requestId, req.user.user_id]);
      if (!requests[0]) return res.status(403).json({ message: "Only the request receiver can update this request." });
      await db.query("UPDATE Roommate_Request SET request_status = ? WHERE roommate_request_id = ?", [status, requestId]);
      return res.json({ message: "Roommate request updated." });
    }

    return res.status(400).json({ message: "Unknown request type." });
  } catch (error) {
    next(error);
  }
});

app.post("/reviews", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "new") return res.status(403).json({ message: "Only New Users can review rooms." });
    const roomId = String(req.body.room_id || "");
    const rating = Number(req.body.rating || 0);
    if (!isValidStringId(roomId)) return res.status(400).json({ message: "Invalid room ID." });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5." });

    const [rooms] = await db.query("SELECT r.owner_id, o.user_id AS owner_user_id FROM Rooms r JOIN Owner o ON o.owner_id = r.owner_id WHERE r.room_id = ?", [roomId]);
    if (!rooms[0]) return res.status(404).json({ message: "Room not found." });

    const [acceptedRequests] = await db.query(
      "SELECT room_request_id FROM Room_Request WHERE room_id = ? AND requester_id = ? AND request_status = 'Accepted'",
      [roomId, req.user.user_id]
    );
    if (!acceptedRequests[0]) return res.status(403).json({ message: "You can review a room only after the owner accepts your request." });

    const [existingReviews] = await db.query("SELECT review_id FROM Review WHERE room_id = ? AND reviewer_id = ?", [roomId, req.user.user_id]);
    if (existingReviews[0]) return res.status(409).json({ message: "You have already reviewed this room." });

    const reviewId = await nextEntityId("Review", "rev_");
    await db.query(
      "INSERT INTO Review (review_id, reviewer_id, owner_id, room_id, rating, review_text) VALUES (?, ?, ?, ?, ?, ?)",
      [reviewId, req.user.user_id, rooms[0].owner_user_id, roomId, rating, req.body.review_text || null]
    );

    res.status(201).json({ message: "Review published." });
  } catch (error) {
    next(error);
  }
});

app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/images") || req.path.startsWith("/auth") || req.path.startsWith("/me") || req.path.startsWith("/rooms") || req.path.startsWith("/dashboard") || req.path.startsWith("/roommates") || req.path.startsWith("/requests") || req.path.startsWith("/reviews") || req.path.startsWith("/stats") || req.path.startsWith("/homepage-data")) {
    return next();
  }
  const indexPath = path.join(frontendDirectory, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send("HomeMate API is running. Frontend build not found in: " + frontendDirectory);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Check your database connection and try again." });
});

const rawPort = process.env.PORT;
const PORT = (rawPort && String(rawPort) !== "22211") ? Number(rawPort) : 5000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`HomeMate server running on port ${PORT}`);
  try {
    await ensureDatabaseInitialized(db);
  } catch (err) {
    console.error("Database initialization notice:", err.message);
  }
});
