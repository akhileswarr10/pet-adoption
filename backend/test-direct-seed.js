const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function seedUsers() {
  try {
    console.log('🌱 Starting direct user seeding...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@petadoption.com' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@petadoption.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, City, State 12345',
      is_active: true
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    
    // Create shelter user
    const shelterUser = await User.create({
      name: 'Happy Paws Shelter',
      email: 'shelter@happypaws.com',
      password: hashedPassword,
      role: 'shelter',
      phone: '+1234567891',
      address: '456 Shelter Avenue, City, State 12345',
      is_active: true
    });
    
    console.log('✅ Shelter user created:', shelterUser.email);
    
    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'user',
      phone: '+1234567893',
      address: '321 User Lane, City, State 12345',
      is_active: true
    });
    
    console.log('✅ Regular user created:', regularUser.email);
    
    console.log('🎉 Direct seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Direct seeding failed:', error);
  }
}

// Run the seeding
seedUsers().then(() => {
  console.log('✅ Seeding process finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Seeding process failed:', error);
  process.exit(1);
});
