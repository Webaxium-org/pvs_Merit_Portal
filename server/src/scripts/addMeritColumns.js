import dotenv from 'dotenv';
import sql from 'mssql';

// Load environment variables first
dotenv.config();

const addMeritColumns = async () => {
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

    // Check if merit columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Employees'
      AND COLUMN_NAME IN ('meritIncreasePercentage', 'meritIncreaseDollar', 'newAnnualSalary', 'newHourlyRate')
    `);

    const existingColumns = checkColumns.recordset.map(row => row.COLUMN_NAME);
    console.log(`\n📋 Existing merit columns: ${existingColumns.length > 0 ? existingColumns.join(', ') : 'None'}`);

    const columnsToAdd = [
      { name: 'meritIncreasePercentage', type: 'DECIMAL(5, 2)', default: '0', comment: 'Merit increase percentage for salaried employees' },
      { name: 'meritIncreaseDollar', type: 'DECIMAL(10, 2)', default: '0', comment: 'Merit increase in dollars for hourly employees' },
      { name: 'newAnnualSalary', type: 'DECIMAL(10, 2)', default: '0', comment: 'New annual salary after merit increase' },
      { name: 'newHourlyRate', type: 'DECIMAL(10, 2)', default: '0', comment: 'New hourly rate after merit increase' }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const column of columnsToAdd) {
      if (existingColumns.includes(column.name)) {
        console.log(`⏭️  Skipping ${column.name} - already exists`);
        skippedCount++;
        continue;
      }

      console.log(`➕ Adding column: ${column.name} ${column.type}`);
      await pool.request().query(`
        ALTER TABLE Employees
        ADD ${column.name} ${column.type} NOT NULL DEFAULT ${column.default}
      `);
      console.log(`✅ Added ${column.name}`);
      addedCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Added: ${addedCount} columns`);
    console.log(`   ⏭️  Skipped: ${skippedCount} columns (already exist)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify all columns are now present
    const verifyColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Employees'
      AND COLUMN_NAME IN ('meritIncreasePercentage', 'meritIncreaseDollar', 'newAnnualSalary', 'newHourlyRate')
      ORDER BY COLUMN_NAME
    `);

    console.log('✅ Merit columns in database:');
    verifyColumns.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT || 'None'})`);
    });

    await pool.close();
    console.log('\n✅ Database connection closed');
    console.log('✅ Merit columns migration completed successfully!\n');
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

addMeritColumns();
