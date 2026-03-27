import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import sql from 'mssql';

// Load environment variables first
dotenv.config();

const createHRUser = async () => {
  let pool;
  try {
    console.log('🔄 Connecting to SQL Server...');

    // Create connection pool
    const config = {
      user: process.env.SQL_SERVER_USER,
      password: process.env.SQL_SERVER_PASSWORD,
      server: process.env.SQL_SERVER_HOST,
      port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
      database: process.env.SQL_SERVER_DATABASE,
      options: {
        encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true',
      },
    };

    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');

    // Hash the password
    const hashedPassword = await bcrypt.hash('abc123xyz', 10);
    console.log('✅ Password hashed successfully');

    // Check if HR user already exists
    const checkResult = await pool.request()
      .input('email', sql.NVarChar, 'hr@pvschemicals.com')
      .query('SELECT id, email, fullName, role FROM Employees WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      console.log('⚠️  HR user already exists. Updating password...');

      // Update existing user
      await pool.request()
        .input('email', sql.NVarChar, 'hr@pvschemicals.com')
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, 'hr')
        .query(`
          UPDATE Employees
          SET password = @password, role = @role
          WHERE email = @email
        `);

      console.log('✅ HR user password updated successfully');
    } else {
      console.log('🆕 Creating new HR user...');

      // Insert new HR user (basic fields only)
      await pool.request()
        .input('employeeId', sql.NVarChar, 'HR001')
        .input('fullName', sql.NVarChar, 'HR Manager')
        .input('email', sql.NVarChar, 'hr@pvschemicals.com')
        .input('password', sql.NVarChar, hashedPassword)
        .input('position', sql.NVarChar, 'HR Manager')
        .input('jobTitle', sql.NVarChar, 'HR Manager')
        .input('role', sql.NVarChar, 'hr')
        .input('department', sql.NVarChar, 'Human Resources')
        .input('company', sql.NVarChar, 'PVS Chemicals')
        .input('isActive', sql.Bit, 1)
        .query(`
          INSERT INTO Employees (
            employeeId, fullName, email, password, position, jobTitle, role,
            department, company, isActive, hireDate, isApprover, createdAt, updatedAt
          )
          VALUES (
            @employeeId, @fullName, @email, @password, @position, @jobTitle, @role,
            @department, @company, @isActive, GETDATE(), 0, GETDATE(), GETDATE()
          )
        `);

      console.log('✅ HR user created successfully!');
    }

    // Fetch and display the HR user
    const result = await pool.request()
      .input('email', sql.NVarChar, 'hr@pvschemicals.com')
      .query(`
        SELECT id, employeeId, fullName, email, role, department, company,
               isActive, createdAt, updatedAt
        FROM Employees
        WHERE email = @email
      `);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ HR User Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    hr@pvschemicals.com');
    console.log('Password: abc123xyz');
    console.log('Role:     HR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (result.recordset.length > 0) {
      console.log('📋 User Details:');
      console.log(JSON.stringify(result.recordset[0], null, 2));
    }

    await pool.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    if (pool) {
      await pool.close();
    }
    process.exit(1);
  }
};

createHRUser();
