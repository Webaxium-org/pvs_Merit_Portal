[ignoring loop detection]
USE [master];
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pvs_merit_db') CREATE DATABASE [pvs_merit_db];
GO
USE [pvs_merit_db];
GO

-- 1. Create Employees Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
BEGIN
    CREATE TABLE [dbo].[Employees] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [employeeId] NVARCHAR(50) NOT NULL,
        [fullName] NVARCHAR(200) NOT NULL,
        [email] NVARCHAR(255) NOT NULL,
        [password] NVARCHAR(255) NOT NULL,
        [ssn] NVARCHAR(50) NULL,
        [position] NVARCHAR(100) NULL,
        [jobTitle] NVARCHAR(100) NULL,
        [department] NVARCHAR(100) NULL,
        [company] NVARCHAR(200) NULL,
        [companyCode] NVARCHAR(50) NULL,
        [location] NVARCHAR(200) NULL,
        [supervisorId] INT NULL,
        [supervisorName] NVARCHAR(200) NULL,
        [role] NVARCHAR(50) DEFAULT 'employee',
        [hireDate] DATETIME NULL,
        [lastHireDate] DATETIME NULL,
        [employeeType] NVARCHAR(50) NULL,
        [salaryType] NVARCHAR(50) NULL,
        [salary] DECIMAL(18, 2) DEFAULT 0,
        [annualSalary] DECIMAL(18, 2) DEFAULT 0,
        [hourlyPayRate] DECIMAL(18, 2) DEFAULT 0,
        [meritIncreasePercentage] DECIMAL(5, 2) DEFAULT 0,
        [meritIncreaseDollar] DECIMAL(18, 2) DEFAULT 0,
        [newAnnualSalary] DECIMAL(18, 2) DEFAULT 0,
        [newHourlyRate] DECIMAL(18, 2) DEFAULT 0,
        [phone] NVARCHAR(50) NULL,
        [addressStreet] NVARCHAR(255) NULL,
        [addressCity] NVARCHAR(100) NULL,
        [addressState] NVARCHAR(50) NULL,
        [addressZipCode] NVARCHAR(20) NULL,
        [addressCountry] NVARCHAR(100) DEFAULT 'USA',
        [isApprover] BIT DEFAULT 0,
        [approverLevel] NVARCHAR(50) NULL,
        [level1ApproverId] INT NULL,
        [level1ApproverName] NVARCHAR(200) NULL,
        [level2ApproverId] INT NULL,
        [level2ApproverName] NVARCHAR(200) NULL,
        [level3ApproverId] INT NULL,
        [level3ApproverName] NVARCHAR(200) NULL,
        [level4ApproverId] INT NULL,
        [level4ApproverName] NVARCHAR(200) NULL,
        [level5ApproverId] INT NULL,
        [level5ApproverName] NVARCHAR(200) NULL,
        [approvalStatus] NVARCHAR(MAX) NULL,
        [meritHistory] NVARCHAR(MAX) NULL,
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    PRINT '✅ Employees table created.';
END

-- 2. Create MeritSettings Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MeritSettings')
BEGIN
    CREATE TABLE [dbo].[MeritSettings] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [meritYear] INT NOT NULL,
        [budgetPercentage] DECIMAL(5, 2) NOT NULL,
        [isActive] BIT DEFAULT 1,
        [createdBy] INT NOT NULL,
        [createdByName] NVARCHAR(200) NOT NULL,
        [notes] NVARCHAR(MAX) NULL,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    PRINT '✅ MeritSettings table created.';
END

-- 3. Create Branches Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Branches')
BEGIN
    CREATE TABLE [dbo].[Branches] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [branchCode] NVARCHAR(50) NOT NULL,
        [branchName] NVARCHAR(200) NOT NULL,
        [location] NVARCHAR(200) NOT NULL,
        [addressStreet] NVARCHAR(255) NULL,
        [addressCity] NVARCHAR(100) NULL,
        [addressState] NVARCHAR(50) NULL,
        [addressZipCode] NVARCHAR(20) NULL,
        [addressCountry] NVARCHAR(100) DEFAULT 'USA',
        [contactPhone] NVARCHAR(50) NULL,
        [contactEmail] NVARCHAR(255) NULL,
        [managerId] INT NULL,
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    PRINT '✅ Branches table created.';
END

-- 4. Create Notifications Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE [dbo].[Notifications] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [recipientId] INT NOT NULL,
        [type] NVARCHAR(50) NOT NULL,
        [title] NVARCHAR(255) NOT NULL,
        [message] NVARCHAR(MAX) NOT NULL,
        [payload] NVARCHAR(MAX) NULL,
        [isRead] BIT DEFAULT 0,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    PRINT '✅ Notifications table created.';
END

-- 5. Insert Initial HR Admin (Pass: abc123xyz)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE email = 'hr@pvschemicals.com')
BEGIN
    INSERT INTO [dbo].[Employees] ([employeeId], [fullName], [email], [password], [role], [isActive])
    VALUES ('HR001', 'Initial HR Admin', 'hr@pvschemicals.com', '$2b$10$zaKbaBM5IQmJaIOntObnMO6PWaNhPIz/nxThpN7RCeFQhzBHh5wJe', 'hr', 1);
    PRINT '✅ Initial HR User created.';
END
GO
