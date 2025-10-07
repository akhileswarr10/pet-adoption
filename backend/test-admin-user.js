const { User } = require('./models');

async function testAdminUser() {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ 
      where: { email: 'admin@petadoption.com' } 
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        is_active: adminUser.is_active
      });
      
      // Test password validation
      const isValidPassword = await adminUser.validatePassword('password123');
      console.log('🔐 Password validation:', isValidPassword ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('❌ Admin user not found! Creating admin user...');
      
      // Create admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@petadoption.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Office',
        is_active: true
      });
      
      console.log('✅ Admin user created:', {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

testAdminUser();
