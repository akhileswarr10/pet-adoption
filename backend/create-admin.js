const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createAdmin() {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@petadoption.com' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('📋 User details:', {
        id: existingAdmin.id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        is_active: existingAdmin.is_active
      });
      return;
    }
    
    console.log('🌱 Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@petadoption.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, City, State 12345',
      is_active: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📋 User details:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      is_active: adminUser.is_active
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
