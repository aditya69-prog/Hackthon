require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = [
  {
    name: 'Admin User', email: 'admin@rnsit.ac.in', usn: '1RN20CS000',
    password: 'admin123', department: 'CSE', year: 4, bio: 'Platform administrator',
    interests: ['Technology', 'Management'], skills: ['Node.js', 'React'],
    intent: 'all', isVerified: true, isAdmin: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Aarav Sharma', email: 'aarav@rnsit.ac.in', usn: '1RN22CS001',
    password: 'pass123', department: 'CSE', year: 3, bio: 'Full-stack dev who loves hackathons 🚀',
    interests: ['Coding', 'Music', 'Cricket', 'AI'], skills: ['React', 'Python', 'MongoDB'],
    intent: 'friends', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Priya Nair', email: 'priya@rnsit.ac.in', usn: '1RN22ISE002',
    password: 'pass123', department: 'ISE', year: 3, bio: 'UI/UX designer & coffee addict ☕',
    interests: ['Design', 'Photography', 'Travel', 'Music'], skills: ['Figma', 'CSS', 'JavaScript'],
    intent: 'study', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Rahul Patil', email: 'rahul@rnsit.ac.in', usn: '1RN23ECE003',
    password: 'pass123', department: 'ECE', year: 2, bio: 'IoT enthusiast building smart things 💡',
    interests: ['Electronics', 'Robotics', 'Gaming', 'Anime'], skills: ['Arduino', 'C++', 'PCB Design'],
    intent: 'study', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Sneha Reddy', email: 'sneha@rnsit.ac.in', usn: '1RN21CS004',
    password: 'pass123', department: 'CSE', year: 4, bio: 'ML researcher | Open source contributor',
    interests: ['AI', 'Reading', 'Yoga', 'Cooking'], skills: ['Python', 'TensorFlow', 'Java'],
    intent: 'friends', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Karthik Gowda', email: 'karthik@rnsit.ac.in', usn: '1RN23ME005',
    password: 'pass123', department: 'ME', year: 2, bio: 'Mechanical engineer with a passion for F1 🏎️',
    interests: ['Cars', 'Football', '3D Printing', 'Music'], skills: ['AutoCAD', 'SolidWorks', 'MATLAB'],
    intent: 'friends', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Ananya Iyer', email: 'ananya@rnsit.ac.in', usn: '1RN24CS006',
    password: 'pass123', department: 'CSE', year: 1, bio: 'Freshman exploring the world of tech 🌟',
    interests: ['Coding', 'Dance', 'Art', 'Movies'], skills: ['HTML', 'CSS', 'Python'],
    intent: 'all', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Vikram Singh', email: 'vikram@rnsit.ac.in', usn: '1RN22EEE007',
    password: 'pass123', department: 'EEE', year: 3, bio: 'Power systems nerd & basketball player 🏀',
    interests: ['Basketball', 'Music', 'Coding', 'Travel'], skills: ['MATLAB', 'Python', 'Simulink'],
    intent: 'relationship', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Meera Joshi', email: 'meera@rnsit.ac.in', usn: '1RN23ISE008',
    password: 'pass123', department: 'ISE', year: 2, bio: 'Data science enthusiast | Dog lover 🐕',
    interests: ['Data Science', 'Pets', 'Cooking', 'Hiking'], skills: ['R', 'SQL', 'Tableau'],
    intent: 'study', isVerified: true, verificationBadge: true, profileCompleted: true
  },
  {
    name: 'Arjun Kumar', email: 'arjun@rnsit.ac.in', usn: '1RN21CE009',
    password: 'pass123', department: 'CE', year: 4, bio: 'Civil engineer dreaming of smart cities 🏗️',
    interests: ['Architecture', 'Photography', 'Chess', 'Cricket'], skills: ['AutoCAD', 'Revit', 'STAAD'],
    intent: 'friends', isVerified: true, verificationBadge: true, profileCompleted: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await User.deleteMany({});
    console.log('Cleared existing users');
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${user.name} (${user.email})`);
    }
    console.log(`\n🌱 Seeded ${seedUsers.length} users successfully!`);
    console.log('\n📧 Admin login: admin@rnsit.ac.in / admin123');
    console.log('📧 User login: aarav@rnsit.ac.in / pass123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
