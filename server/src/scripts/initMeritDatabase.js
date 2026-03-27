import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const initMeritDatabase = async () => {
  try {
    console.log('========================================');
    console.log('Merit Database Initialization Script');
    console.log('========================================\n');

    // Parse instance name from host (e.g., "localhost\\SQLEXPRESS")
    const host = process.env.SQL_SERVER_HOST || 'localhost';
    const instanceName = host.includes('\\') ? host.split('\\')[1] : undefined;
    const serverName = host.includes('\\') ? host.split('\\')[0] : host;

    const dialectOptions = {
      options: {
        encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT !== 'false',
        enableArithAbort: true,
      },
      authentication: {
        type: 'default',
      },
    };

    // Only add instanceName if it exists
    if (instanceName) {
      dialectOptions.options.instanceName = instanceName;
    }

    console.log('Database Configuration:');
    console.log(`- Server: ${serverName}${instanceName ? '\\' + instanceName : ''}`);
    console.log(`- Database: ${process.env.SQL_SERVER_DATABASE}`);
    console.log(`- User: ${process.env.SQL_SERVER_USER}\n`);

    // Create Sequelize instance
    const sequelize = new Sequelize({
      dialect: 'mssql',
      host: serverName,
      port: instanceName ? undefined : (parseInt(process.env.SQL_SERVER_PORT) || 1433),
      database: process.env.SQL_SERVER_DATABASE,
      username: process.env.SQL_SERVER_USER,
      password: process.env.SQL_SERVER_PASSWORD,
      dialectOptions,
      logging: console.log, // Enable logging for this script
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    // Test connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!\n');

    // Initialize models
    console.log('Initializing models...');
    const { initModels } = await import('../models/sql/index.js');
    const models = initModels(sequelize);
    console.log('✅ Models initialized\n');

    // Sync database (create tables)
    console.log('Creating database tables...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Tables created successfully!\n');

    // Get table list
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_CATALOG = '${process.env.SQL_SERVER_DATABASE}'
      ORDER BY TABLE_NAME
    `);

    console.log('Created Tables:');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
    });

    console.log('\n========================================');
    console.log('Merit Database Initialization Complete!');
    console.log('========================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error initializing Merit database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the script
initMeritDatabase();
