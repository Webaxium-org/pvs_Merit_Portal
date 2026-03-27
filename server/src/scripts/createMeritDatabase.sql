-- SQL Script to create Merit System Database
-- Run this script with SQL Server Management Studio or an administrator account

USE master;
GO

-- Create the Merit database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pvs_merit_db')
BEGIN
    CREATE DATABASE pvs_merit_db;
    PRINT 'Database pvs_merit_db created successfully.';
END
ELSE
BEGIN
    PRINT 'Database pvs_merit_db already exists.';
END
GO

-- Switch to the new database
USE pvs_merit_db;
GO

-- Grant permissions to pvs_user (if needed)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'pvs_user')
BEGIN
    CREATE USER pvs_user FOR LOGIN pvs_user;
    EXEC sp_addrolemember 'db_owner', 'pvs_user';
    PRINT 'User pvs_user created and granted permissions.';
END
ELSE
BEGIN
    EXEC sp_addrolemember 'db_owner', 'pvs_user';
    PRINT 'User pvs_user already exists. Permissions granted.';
END
GO

PRINT 'Merit database setup completed successfully.';
GO
