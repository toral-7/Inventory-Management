require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../migrations/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and filter empty statements
    const statements = sql.split(';').map(s => s.trim()).filter(s => s);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { data, error } = await supabase.rpc('execute_sql', { sql: statement });
      
      if (error) {
        // Some errors are expected (table already exists), so log but continue
        console.warn(`⚠ Warning: ${error.message}`);
      } else {
        console.log('✓ Success');
      }
    }
    
    console.log('✅ Migrations completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

// Alternative: Use Supabase SQL Editor directly (manual approach)
console.log('📝 Migration Instructions:');
console.log('1. Go to Supabase dashboard');
console.log('2. Click "SQL Editor" on the left sidebar');
console.log('3. Create new query');
console.log('4. Copy-paste contents of migrations/init.sql');
console.log('5. Click "Run"');
console.log('\nOR run this script with: npm run migrate');
console.log('(Note: RPC execute_sql requires pg_net extension enabled)\n');

// For now, just log the migration path
console.log('Migrations ready at: migrations/init.sql');
