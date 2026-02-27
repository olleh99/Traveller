const { sequelize } = require('./config/sequelize');
const { Notification } = require('./models/sequelize');

async function syncNotificationTable() {
  try {
    console.log('Syncing Notification table...');
    
    // Drop and recreate the table with correct data types
    await Notification.sync({ force: true });
    
    console.log('✅ Notification table synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing table:', error);
    process.exit(1);
  }
}

syncNotificationTable();