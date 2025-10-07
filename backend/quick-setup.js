const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');

async function quickSetup() {
  try {
    console.log('🚀 Starting quick setup...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database sync successful');
    
    // Check if admin exists
    let admin = await User.findOne({ where: { email: 'admin@petadoption.com' } });
    
    if (admin) {
      console.log('✅ Admin user already exists');
    } else {
      console.log('🌱 Creating admin user...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@petadoption.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        address: '123 Admin Street',
        is_active: true
      });
      console.log('✅ Admin user created');
    }
    
    // Test password validation
    const isValid = await admin.validatePassword('password123');
    console.log('🔐 Password validation test:', isValid ? '✅ PASS' : '❌ FAIL');
    
    // Show admin details
    console.log('👤 Admin user details:');
    console.log('   ID:', admin.id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.is_active);
    
    console.log('🎉 Quick setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick setup failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

quickSetup();
