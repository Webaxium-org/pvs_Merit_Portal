import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const verifyHRUser = async () => {
  try {
    console.log('========================================');
    console.log('Verifying HR User');
    console.log('========================================\n');

    // Parse instance name from host
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

    if (instanceName) {
      dialectOptions.options.instanceName = instanceName;
    }

    // Create Sequelize instance
    const sequelize = new Sequelize({
      dialect: 'mssql',
      host: serverName,
      port: instanceName ? undefined : (parseInt(process.env.SQL_SERVER_PORT) || 1433),
      database: process.env.SQL_SERVER_DATABASE,
      username: process.env.SQL_SERVER_USER,
      password: process.env.SQL_SERVER_PASSWORD,
      dialectOptions,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    // Test connection
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected!\n');

    // Initialize models
    const { initModels } = await import('../models/sql/index.js');
    const models = initModels(sequelize);

    // Check for HR user
    console.log('Checking for HR user...\n');
    const hrUser = await models.Employee.findOne({
      where: {
        email: 'hr@pvschemicals.com',
      },
    });

    if (hrUser) {
      console.log('✅ HR User Found!');
      console.log('========================================');
      console.log(`Employee ID: ${hrUser.employeeId}`);
      console.log(`Full Name: ${hrUser.fullName}`);
      console.log(`Email: ${hrUser.email}`);
      console.log(`Role: ${hrUser.role}`);
      console.log(`Is Active: ${hrUser.isActive}`);
      console.log(`Created At: ${hrUser.createdAt}`);
      console.log('========================================\n');
      console.log('Login Credentials:');
      console.log('Email: hr@pvschemicals.com');
      console.log('Password: abc123xyz');
      console.log('========================================\n');
    } else {
      console.log('❌ HR User NOT Found!');
      console.log('Run this command to create the HR user:');
      console.log('npm run merit:seed-hr\n');
    }

    // Show all users
    const allUsers = await models.Employee.findAll({
      attributes: ['id', 'employeeId', 'fullName', 'email', 'role', 'isActive'],
    });

    console.log(`Total Users in Database: ${allUsers.length}\n`);
    if (allUsers.length > 0) {
      console.log('All Users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the script
verifyHRUser();
