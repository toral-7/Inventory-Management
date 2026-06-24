require('dotenv').config();
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // 1. Create branches
    console.log('Creating branches...');
    const branchesData = [
      { name: 'Branch A', location: 'Mumbai Downtown' },
      { name: 'Branch B', location: 'Mumbai Suburbs' },
      { name: 'Branch C', location: 'Navi Mumbai' }
    ];
    
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .insert(branchesData)
      .select();
    
    if (branchError) throw branchError;
    console.log(`✓ Created ${branches.length} branches\n`);
    
    // 2. Create suppliers
    console.log('Creating suppliers...');
    const suppliersData = [
      { name: 'Supplier A', contact_person: 'John', email: 'john@supplier-a.com', phone: '9876543210', lead_time_days: 2 },
      { name: 'Supplier B', contact_person: 'Jane', email: 'jane@supplier-b.com', phone: '9876543211', lead_time_days: 3 },
      { name: 'Supplier C', contact_person: 'Bob', email: 'bob@supplier-c.com', phone: '9876543212', lead_time_days: 1 },
      { name: 'Supplier D', contact_person: 'Alice', email: 'alice@supplier-d.com', phone: '9876543213', lead_time_days: 5 },
      { name: 'Supplier E', contact_person: 'Charlie', email: 'charlie@supplier-e.com', phone: '9876543214', lead_time_days: 4 }
    ];
    
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .insert(suppliersData)
      .select();
    
    if (supplierError) throw supplierError;
    console.log(`✓ Created ${suppliers.length} suppliers\n`);
    
    // 3. Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersData = [
      { email: 'admin@inventory.com', password_hash: hashedPassword, name: 'Admin User', role: 'admin', branch_id: branches[0].id },
      { email: 'staff1@inventory.com', password_hash: hashedPassword, name: 'Staff One', role: 'staff', branch_id: branches[0].id },
      { email: 'staff2@inventory.com', password_hash: hashedPassword, name: 'Staff Two', role: 'staff', branch_id: branches[1].id },
      { email: 'staff3@inventory.com', password_hash: hashedPassword, name: 'Staff Three', role: 'staff', branch_id: branches[2].id },
      { email: 'staff4@inventory.com', password_hash: hashedPassword, name: 'Staff Four', role: 'staff', branch_id: branches[0].id }
    ];
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(usersData)
      .select();
    
    if (userError) throw userError;
    console.log(`✓ Created ${users.length} users\n`);
    
    // 4. Create products (20 generic products)
    console.log('Creating products...');
    const productsData = [
      { name: 'Product 1', base_price: 100.00, category: 'Category A', supplier_id: suppliers[0].id, reorder_level: 10 },
      { name: 'Product 2', base_price: 150.00, category: 'Category A', supplier_id: suppliers[0].id, reorder_level: 15 },
      { name: 'Product 3', base_price: 200.00, category: 'Category B', supplier_id: suppliers[1].id, reorder_level: 8 },
      { name: 'Product 4', base_price: 75.00, category: 'Category B', supplier_id: suppliers[1].id, reorder_level: 20 },
      { name: 'Product 5', base_price: 300.00, category: 'Category C', supplier_id: suppliers[2].id, reorder_level: 5 },
      { name: 'Product 6', base_price: 50.00, category: 'Category C', supplier_id: suppliers[2].id, reorder_level: 25 },
      { name: 'Product 7', base_price: 250.00, category: 'Category A', supplier_id: suppliers[3].id, reorder_level: 12 },
      { name: 'Product 8', base_price: 120.00, category: 'Category D', supplier_id: suppliers[3].id, reorder_level: 18 },
      { name: 'Product 9', base_price: 180.00, category: 'Category D', supplier_id: suppliers[4].id, reorder_level: 10 },
      { name: 'Product 10', base_price: 90.00, category: 'Category B', supplier_id: suppliers[4].id, reorder_level: 22 },
      { name: 'Product 11', base_price: 220.00, category: 'Category E', supplier_id: suppliers[0].id, reorder_level: 7 },
      { name: 'Product 12', base_price: 110.00, category: 'Category E', supplier_id: suppliers[1].id, reorder_level: 16 },
      { name: 'Product 13', base_price: 270.00, category: 'Category A', supplier_id: suppliers[2].id, reorder_level: 9 },
      { name: 'Product 14', base_price: 160.00, category: 'Category C', supplier_id: suppliers[3].id, reorder_level: 14 },
      { name: 'Product 15', base_price: 130.00, category: 'Category B', supplier_id: suppliers[4].id, reorder_level: 11 },
      { name: 'Product 16', base_price: 310.00, category: 'Category D', supplier_id: suppliers[0].id, reorder_level: 6 },
      { name: 'Product 17', base_price: 95.00, category: 'Category E', supplier_id: suppliers[1].id, reorder_level: 19 },
      { name: 'Product 18', base_price: 240.00, category: 'Category A', supplier_id: suppliers[2].id, reorder_level: 13 },
      { name: 'Product 19', base_price: 175.00, category: 'Category C', supplier_id: suppliers[3].id, reorder_level: 17 },
      { name: 'Product 20', base_price: 140.00, category: 'Category D', supplier_id: suppliers[4].id, reorder_level: 10 }
    ];
    
    const { data: products, error: productError } = await supabase
      .from('products')
      .insert(productsData)
      .select();
    
    if (productError) throw productError;
    console.log(`✓ Created ${products.length} products\n`);
    
    // 5. Create inventory entries (each product in each branch)
    console.log('Creating inventory entries...');
    const inventoryData = [];
    for (const product of products) {
      for (const branch of branches) {
        inventoryData.push({
          product_id: product.id,
          branch_id: branch.id,
          quantity_in_stock: Math.floor(Math.random() * 100) + 5 // Random 5-105
        });
      }
    }
    
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select();
    
    if (inventoryError) throw inventoryError;
    console.log(`✓ Created ${inventory.length} inventory entries\n`);
    
    console.log('✅ Seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: admin@inventory.com');
    console.log('   Password: password123\n');
    console.log('📦 Test Data Summary:');
    console.log(`   - Branches: ${branches.length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Inventory Entries: ${inventory.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
