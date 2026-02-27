const { sequelize } = require('./config/sequelize');

async function fixMatchingTable() {
  try {
    console.log('Checking and fixing companion_matches table...');
    
    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'traveller_db' 
      AND TABLE_NAME = 'companion_matches' 
      AND COLUMN_NAME = 'matching_request_id'
    `);
    
    if (results.length === 0) {
      console.log('Adding matching_request_id column...');
      await sequelize.query(`
        ALTER TABLE companion_matches 
        ADD COLUMN matching_request_id VARCHAR(36) 
        AFTER travel_plan_id
      `);
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ Column already exists');
    }
    
    // Force sync the model to ensure all columns are correct
    const { CompanionMatch } = require('./models/sequelize');
    await CompanionMatch.sync({ alter: true });
    console.log('✅ Table structure synchronized');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing table:', error);
    process.exit(1);
  }
}

fixMatchingTable();