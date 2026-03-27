import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables first
dotenv.config();

const createHRUser = async () => {
  try {
    // Dynamic imports after dotenv is loaded
    const { connectSQLDB, getSequelize } = await import('../config/sqlDatabase.js');
    const { getEmployee } = await import('../models/sql/Employee.js');

    // Initialize Sequelize connection
    await connectSQLDB();
    const sequelize = getSequelize();

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server');

    // Get Employee model
    const Employee = getEmployee();

    // Hash the password
    const hashedPassword = await bcrypt.hash('abc123xyz', 10);
    console.log('✅ Password hashed successfully');

    // HR employee data
    const hrEmployee = {
      employeeId: "HR001",
      fullName: "HR Manager",
      email: "hr@pvschemicals.com",
      password: hashedPassword,
      position: "HR Manager",
      jobTitle: "HR Manager",
      role: "hr",
      hireDate: new Date("2020-01-01T00:00:00.000Z"),
      salary: 75000,
      annualSalary: 75000,
      isApprover: false,
      isActive: true,

      // Set default values for other fields
      ssn: null,
      department: "Human Resources",
      company: 'PVS Chemicals',
      companyCode: 'PVS',
      location: 'Main Office',
      supervisorId: null,
      supervisorName: null,
      lastHireDate: null,
      employeeType: 'Full-Time',
      salaryType: 'Salary',
      hourlyPayRate: 0,
      meritIncreasePercentage: 0,
      meritIncreaseDollar: 0,
      newAnnualSalary: 0,
      newHourlyRate: 0,
      phone: null,
      addressStreet: null,
      addressCity: null,
      addressState: null,
      addressZipCode: null,
      addressCountry: 'USA',
      approverLevel: null,
      level1ApproverId: null,
      level1ApproverName: null,
      level2ApproverId: null,
      level2ApproverName: null,
      level3ApproverId: null,
      level3ApproverName: null,
      level4ApproverId: null,
      level4ApproverName: null,
      level5ApproverId: null,
      level5ApproverName: null,
      approvalStatus: null
    };

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      where: { email: hrEmployee.email }
    });

    if (existingEmployee) {
      console.log('⚠️  HR user with email hr@pvschemicals.com already exists. Updating password...');
      await Employee.update(
        { password: hashedPassword },
        { where: { email: hrEmployee.email } }
      );
      console.log('✅ HR user password updated successfully');
    } else {
      // Insert the employee
      const newEmployee = await Employee.create(hrEmployee);
      console.log('✅ HR user created successfully!');
      console.log('Employee ID:', newEmployee.id);
      console.log('Employee Code:', newEmployee.employeeId);
      console.log('Name:', newEmployee.fullName);
      console.log('Email:', newEmployee.email);
      console.log('Role:', newEmployee.role);
    }

    // Fetch and display the employee
    const employee = await Employee.findOne({
      where: { email: hrEmployee.email },
      attributes: { exclude: ['password'] }
    });

    console.log('\n📋 HR User Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    hr@pvschemicals.com');
    console.log('Password: abc123xyz');
    console.log('Role:     HR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nEmployee Details:', JSON.stringify(employee, null, 2));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating HR user:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createHRUser();
