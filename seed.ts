// import dotenv from 'dotenv';
// dotenv.config();

// import { connectDB } from './src/config/db';
// import Role from './src/models/role.model';
// import User from './src/models/user.model';
// import bcrypt from 'bcryptjs';

// async function seed() {
//   await connectDB();

//   const adminRole = await Role.findOneAndUpdate(
//     { roleName: 'Admin' },
//     {
//       roleName: 'Admin',
//       permissions: ['user:create', 'user:read', 'role:create'],
//       roleId: 'R001',
//     },
//     { upsert: true, new: true }
//   );

//   await User.findOneAndUpdate(
//     { userName: 'admin' },
//     {
//       userName: 'admin',
//       role: adminRole._id,
//       password: await bcrypt.hash('Secure@123', 10),
//       email: 'admin@hospital.com',
//       name: 'System Admin',
//       contactNo: '0112345678',
//       userId: 'E0001',
//     },
//     { upsert: true }
//   );

//   console.log('✅ Database seeded');
// }

// seed()
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error('❌ Seeding failed:', err);
//     process.exit(1);
//   });
