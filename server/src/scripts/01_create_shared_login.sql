USE [master];
GO
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'pvs_user')
BEGIN
    CREATE LOGIN [pvs_user] WITH PASSWORD = 'PVSChemicals@2025Secure', CHECK_POLICY = OFF;
    ALTER SERVER ROLE [sysadmin] ADD MEMBER [pvs_user];
    PRINT '✅ Shared Login [pvs_user] created successfully.';
END
ELSE PRINT 'ℹ️ Login [pvs_user] already exists.';
GO
