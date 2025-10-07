const bcrypt = require('bcryptjs');
const { User, Pet, Adoption, Donation, sequelize } = require('./models');

async function fixAdminNow() {
  try {
    console.log('🔧 Emergency admin fix starting...');
    
    // Force sync database to ensure tables exist
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized');
    
    // Delete existing admin if exists (to avoid conflicts)
    await User.destroy({ where: { email: 'admin@petadoption.com' } });
    console.log('🗑️ Cleared existing admin user');
    
    // Create fresh admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@petadoption.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, City, State 12345',
      is_active: true
    });
    
    console.log('✅ Fresh admin user created:', admin.email);
    
    // Create some test users for stats
    const shelterPassword = await bcrypt.hash('password123', 12);
    await User.create({
      name: 'Happy Paws Shelter',
      email: 'shelter@happypaws.com',
      password: shelterPassword,
      role: 'shelter',
      phone: '+1234567891',
      address: '456 Shelter Avenue',
      is_active: true
    });
    
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: shelterPassword,
      role: 'user',
      phone: '+1234567892',
      address: '789 User Street',
      is_active: true
    });
    
    console.log('✅ Test users created for statistics');
    
    // Test admin login
    const testAdmin = await User.findOne({ where: { email: 'admin@petadoption.com' } });
    const passwordValid = await testAdmin.validatePassword('password123');
    
    console.log('🔐 Password validation test:', passwordValid ? '✅ PASS' : '❌ FAIL');
    
    // Count users for stats
    const userStats = {
      totalUsers: await User.count(),
      activeUsers: await User.count({ where: { role: 'user', is_active: true } }),
      activeShelters: await User.count({ where: { role: 'shelter', is_active: true } }),
      activeAdmins: await User.count({ where: { role: 'admin', is_active: true } })
    };
    
    console.log('📊 User statistics:', userStats);
    console.log('🎉 Admin fix completed successfully!');
    console.log('🔑 Login credentials: admin@petadoption.com / password123');
    
  } catch (error) {
    console.error('❌ Admin fix failed:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminNow();
