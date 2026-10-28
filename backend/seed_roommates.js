const { createPool } = require('./db');
const crypto = require('crypto');

const hashPassword = password => crypto.scryptSync(password, 'homemate-salt', 64).toString('hex');

async function seed() {
  const pool = createPool();

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
      name: 'Priya Kulkarni',
      email: 'priya.kulkarni@example.com',
      age: 24,
      gender: 'Female',
      mob_num: '9765432109',
      role: 'new',
      occupation: 'Data Analyst',
      education: 'M.Sc Statistics, Pune University',
      bio: 'Quiet and organized data analyst. Looking for a flatmate to share a 2BHK flat near Kothrud or Karve Nagar.',
      preferred_location: 'Pune Kothrud',
      min_budget: 9000,
      max_budget: 15000,
      preferred_room_type: 'Private Room',
      lifestyle: 'Working Professional',
      food_preference: 'Vegetarian',
      caste: 'Brahmin',
      religion: 'Hindu',
      smoking: 'No'
    },
    {
      user_id: 'u_204',
      profile_id: 'prof_204',
      preference_id: 'pref_204',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      age: 26,
      gender: 'Male',
      mob_num: '9822334455',
      role: 'existing',
      occupation: 'Full Stack Engineer',
      education: 'B.E. IT, MIT Pune',
      bio: 'IT professional working in Phase 3 Hinjewadi. Respect privacy, keep common areas tidy, love gaming on weekends.',
      preferred_location: 'Pune Hinjewadi',
      min_budget: 8000,
      max_budget: 14000,
      preferred_room_type: 'Shared Room',
      lifestyle: 'Working Professional',
      food_preference: 'Eggetarian',
      caste: 'Open',
      religion: 'Hindu',
      smoking: 'No'
    },
    {
      user_id: 'u_205',
      profile_id: 'prof_205',
      preference_id: 'pref_205',
      name: 'Sneha Iyer',
      email: 'sneha.iyer@example.com',
      age: 24,
      gender: 'Female',
      mob_num: '9988776655',
      role: 'new',
      occupation: 'Financial Analyst',
      education: 'MBA Finance, JBIMS Mumbai',
      bio: 'Finance analyst based in Powai. Looking for a non-smoking female flatmate for a furnished apartment.',
      preferred_location: 'Mumbai Powai',
      min_budget: 14000,
      max_budget: 22000,
      preferred_room_type: 'Single Room',
      lifestyle: 'Early Riser',
      food_preference: 'Vegetarian',
      caste: 'Open',
      religion: 'Hindu',
      smoking: 'No'
    },
    {
      user_id: 'u_206',
      profile_id: 'prof_206',
      preference_id: 'pref_206',
      name: 'Aditya Deshmukh',
      email: 'aditya.deshmukh@example.com',
      age: 25,
      gender: 'Male',
      mob_num: '9711223344',
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

  console.log('Seeded successfully 6 roommate profiles with Pune, Mumbai, Pune Karve Nagar, etc.!');
  process.exit(0);
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
