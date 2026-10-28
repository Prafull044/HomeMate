const fs = require('fs');
const path = require('path');
const { createPool } = require('./db');
const crypto = require('crypto');

const hashPassword = password => crypto.scryptSync(password, 'homemate-salt', 64).toString('hex');

async function setupDatabase(existingPool) {
  console.log('--- HomeMate Database Initialization ---');
  const pool = existingPool || createPool();
  let conn;

  try {
    conn = await pool.getConnection();
    console.log(' Connected to MySQL database successfully.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const rawSql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL into statements, filtering out CREATE DATABASE and USE statements
    const statements = rawSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (!stmt) return false;
        const upper = stmt.toUpperCase();
        if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) {
          return false;
        }
        return true;
      });

    console.log(`Executing ${statements.length} table and schema statements...`);
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const stmt of statements) {
      if (stmt.length > 0) {
        await pool.query(stmt);
      }
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(' All tables & ID sequences initialized.');

    // Run migration checks
    try {
      const [cols] = await pool.query('DESCRIBE Users');
      const colNames = cols.map(c => c.Field);
      if (!colNames.includes('role')) {
        await pool.query("ALTER TABLE Users ADD COLUMN role ENUM('new', 'existing', 'owner') NULL");
      }
      if (!colNames.includes('password_hash')) {
        await pool.query('ALTER TABLE Users ADD COLUMN password_hash VARCHAR(128) NULL');
        if (colNames.includes('password')) {
          await pool.query('UPDATE Users SET password_hash = password WHERE password_hash IS NULL');
        }
      }
      console.log(' Schema migrations validated.');
    } catch (migErr) {
      console.warn('Migration warning:', migErr.message);
    }

    // Check if we need to seed
    const [userRows] = await pool.query('SELECT COUNT(*) AS cnt FROM Users');
    if (userRows[0].cnt === 0) {
      console.log('Database is empty. Seeding initial roommate and room data...');
      
      const candidates = [
        {
          user_id: 'u_201',
          profile_id: 'prof_201',
          preference_id: 'pref_201',
          name: 'Ananya Sharma',
          email: 'ananya.sharma@example.com',
          age: 23,
          gender: 'Female',
          mob_num: '9823011223',
          role: 'existing',
          occupation: 'Software Engineer',
          education: 'B.Tech Computer Science, COEP Pune',
          bio: 'Friendly software engineer working in Baner. Looking for a clean, quiet roommate near Karve Nagar or Kothrud.',
          preferred_location: 'Pune Karve Nagar',
          min_budget: 10000,
          max_budget: 16000,
          preferred_room_type: 'Single Room',
          lifestyle: 'Early Riser',
          food_preference: 'Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        },
        {
          user_id: 'u_202',
          profile_id: 'prof_202',
          preference_id: 'pref_202',
          name: 'Rohan Verma',
          email: 'rohan.verma@example.com',
          age: 25,
          gender: 'Male',
          mob_num: '9890123456',
          role: 'existing',
          occupation: 'Senior UI/UX Designer',
          education: 'B.Des, NID Ahmedabad',
          bio: 'Product designer at a Fintech startup in BKC. Love cooking, music, and weekend coding jams.',
          preferred_location: 'Mumbai Bandra West',
          min_budget: 15000,
          max_budget: 25000,
          preferred_room_type: 'Shared Flat',
          lifestyle: 'Night Owl',
          food_preference: 'Non-Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        },
        {
          user_id: 'u_203',
          profile_id: 'prof_203',
          preference_id: 'pref_203',
          name: 'Pooja Iyer',
          email: 'pooja.iyer@example.com',
          age: 22,
          gender: 'Female',
          mob_num: '9765432109',
          role: 'existing',
          occupation: 'Data Analyst',
          education: 'M.Sc Statistics, Pune University',
          bio: 'Data analyst working in Hinjawadi Phase 1. Calm, studious, non-smoker, enjoys morning yoga and reading.',
          preferred_location: 'Pune Hinjawadi',
          min_budget: 8000,
          max_budget: 14000,
          preferred_room_type: 'Shared Room',
          lifestyle: 'Early Riser',
          food_preference: 'Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        },
        {
          user_id: 'u_204',
          profile_id: 'prof_204',
          preference_id: 'pref_204',
          name: 'Aditya Kulkarni',
          email: 'aditya.kulkarni@example.com',
          age: 26,
          gender: 'Male',
          mob_num: '9123456780',
          role: 'existing',
          occupation: 'Marketing Specialist',
          education: 'MBA Marketing, SIBM Pune',
          bio: 'Growth marketer in Koregaon Park. Big foodie, extroverted, plays badminton on weekends.',
          preferred_location: 'Pune Koregaon Park',
          min_budget: 14000,
          max_budget: 22000,
          preferred_room_type: 'Single Room',
          lifestyle: 'Flexible',
          food_preference: 'Non-Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        },
        {
          user_id: 'u_205',
          profile_id: 'prof_205',
          preference_id: 'pref_205',
          name: 'Sneha Patil',
          email: 'sneha.patil@example.com',
          age: 24,
          gender: 'Female',
          mob_num: '9811223344',
          role: 'existing',
          occupation: 'Frontend Developer',
          education: 'BE IT, Cummins College of Engineering',
          bio: 'Frontend developer passionate about UI/UX. Looking for female flatmate in Kothrud or Karve Nagar.',
          preferred_location: 'Pune Kothrud',
          min_budget: 9000,
          max_budget: 15000,
          preferred_room_type: 'Single Room',
          lifestyle: 'Night Owl',
          food_preference: 'Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        },
        {
          user_id: 'u_206',
          profile_id: 'prof_206',
          preference_id: 'pref_206',
          name: 'Vikram Mehta',
          email: 'vikram.mehta@example.com',
          age: 27,
          gender: 'Male',
          mob_num: '9988776655',
          role: 'existing',
          occupation: 'Product Manager',
          education: 'B.Tech, VJTI Mumbai',
          bio: 'Product Manager at a SaaS company. Social, loves coffee & fitness. Looking for a roommate in Viman Nagar or Kalyani Nagar.',
          preferred_location: 'Pune Viman Nagar',
          min_budget: 12000,
          max_budget: 18000,
          preferred_room_type: 'Private Room',
          lifestyle: 'Fitness Enthusiast',
          food_preference: 'Non-Vegetarian',
          caste: 'Open',
          religion: 'Hindu',
          smoking: 'No'
        }
      ];

      for (const c of candidates) {
        await pool.query(`
          INSERT INTO Users (user_id, name, email, password_hash, age, gender, mob_num, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age), gender=VALUES(gender), role=VALUES(role)
        `, [c.user_id, c.name, c.email, hashPassword('password123'), c.age, c.gender, c.mob_num, c.role]);

        await pool.query(`
          INSERT INTO User_Profile (profile_id, user_id, occupation, education, bio)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE occupation=VALUES(occupation), education=VALUES(education), bio=VALUES(bio)
        `, [c.profile_id, c.user_id, c.occupation, c.education, c.bio]);

        await pool.query(`
          INSERT INTO User_Preferences (preference_id, user_id, preferred_location, min_budget, max_budget, preferred_room_type, lifestyle, food_preference, caste, religion, smoking)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE preferred_location=VALUES(preferred_location), min_budget=VALUES(min_budget), max_budget=VALUES(max_budget), preferred_room_type=VALUES(preferred_room_type), lifestyle=VALUES(lifestyle), food_preference=VALUES(food_preference)
        `, [c.preference_id, c.user_id, c.preferred_location, c.min_budget, c.max_budget, c.preferred_room_type, c.lifestyle, c.food_preference, c.caste, c.religion, c.smoking]);
      }
      console.log(' Sample roommate profiles successfully seeded!');

      // Seed a sample owner and verified rooms
      const ownerUserId = 'u_owner_101';
      const ownerId = 'own_101';
      await pool.query(`
        INSERT INTO Users (user_id, name, email, password_hash, age, gender, mob_num, role)
        VALUES (?, 'Rajesh Deshmukh', 'owner@homemate.com', ?, 42, 'Male', '9822001122', 'owner')
        ON DUPLICATE KEY UPDATE name=VALUES(name)
      `, [ownerUserId, hashPassword('password123')]);

      await pool.query(`
        INSERT INTO Owner (owner_id, user_id, owner_type, verification_status)
        VALUES (?, ?, 'Individual', 'Verified')
        ON DUPLICATE KEY UPDATE verification_status='Verified'
      `, [ownerId, ownerUserId]);

      const sampleRooms = [
        {
          room_id: 'rm_101',
          title: 'Cozy Sunlit 1BHK in Baner High Street',
          type: '1BHK',
          rent: 18000,
          deposit: 35000,
          desc: 'Spacious and fully furnished apartment right next to Baner High Street with high-speed WiFi, modern kitchen, and dedicated parking.',
          address: '4th Floor, Platinum Towers, Baner Road',
          area: 'Baner',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411045'
        },
        {
          room_id: 'rm_102',
          title: 'Private Room in Premium 3BHK Flat - Koregaon Park',
          type: 'Single Room',
          rent: 14500,
          deposit: 25000,
          desc: 'Private master bedroom with attached bathroom in a luxury 3BHK flat in Koregaon Park Lane 7. Friendly working roommates.',
          address: 'Lane 7, South Main Road, Koregaon Park',
          area: 'Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        },
        {
          room_id: 'rm_103',
          title: 'Furnished Shared Studio - Bandra West',
          type: 'Shared Room',
          rent: 16000,
          deposit: 30000,
          desc: 'Ideal for creative professionals and students. 5 minutes from Bandra station, air-conditioned with 24x7 water supply.',
          address: 'Hill Road, Near Bandra Station',
          area: 'Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050'
        }
      ];

      for (const r of sampleRooms) {
        await pool.query(`
          INSERT INTO Rooms (room_id, owner_id, room_title, room_type, rent, deposit, availability_status, description)
          VALUES (?, ?, ?, ?, ?, ?, 'Available', ?)
          ON DUPLICATE KEY UPDATE room_title=VALUES(room_title), rent=VALUES(rent)
        `, [r.room_id, ownerId, r.title, r.type, r.rent, r.deposit, r.desc]);

        await pool.query(`
          INSERT INTO Location (location_id, room_id, address, area, city, state, pincode)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE city=VALUES(city), area=VALUES(area)
        `, [`loc_${r.room_id}`, r.room_id, r.address, r.area, r.city, r.state, r.pincode]);

        await pool.query(`
          INSERT INTO Room_Facilities (facility_id, room_id, wifi, parking, furnished, kitchen, attached_bathroom, electricity, water_supply)
          VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE wifi=1
        `, [`fac_${r.room_id}`, r.room_id]);

        await pool.query(`
          INSERT INTO Room_Requirements (requirement_id, room_id, preferred_gender, smoking_preference, food_preference, pets_allowed)
          VALUES (?, ?, 'Any', 'No', 'Any', 0)
          ON DUPLICATE KEY UPDATE preferred_gender='Any'
        `, [`req_${r.room_id}`, r.room_id]);
      }
      console.log(' Sample verified rooms successfully seeded!');
    } else {
      console.log(`Database already has ${userRows[0].cnt} users registered. Skipping sample data seed.`);
    }

    console.log('\n---  Database is 100% Ready for HomeMate! ---');
  } catch (err) {
    console.error('\nDatabase setup failed with error:', err.message);
    if (!existingPool) process.exit(1);
    throw err;
  } finally {
    if (conn) conn.release();
    if (!existingPool) await pool.end();
  }
}

async function ensureDatabaseInitialized(pool) {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'Users'");
    if (!rows || rows.length === 0) {
      console.log('Users table not found. Auto-running database setup on startup...');
      await setupDatabase(pool);
    } else {
      console.log('Database verified. Tables exist and ready.');
    }
  } catch (e) {
    console.warn('Database auto-initialization notice:', e.message);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, ensureDatabaseInitialized };
