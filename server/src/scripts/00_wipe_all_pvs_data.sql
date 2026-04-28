-- ==========================================================
-- PVS SYSTEMS: EMERGENCY WIPE SCRIPT
-- ==========================================================
-- USE THIS SCRIPT ONLY IF YOU WANT TO DELETE EVERYTHING
-- AND START FROM A COMPLETELY CLEAN SLATE.
-- ==========================================================

USE [master];
GO

PRINT '⚠️  Starting Emergency Wipe...';

-- 1. Terminate all active connections to the databases
DECLARE @kill varchar(8000) = '';  
SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';'  
FROM sys.dm_exec_sessions
WHERE database_id  IN (db_id('pvs_merit_db'), db_id('pvs_db'))
EXEC(@kill);

-- 2. Drop the Databases
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'pvs_merit_db')
BEGIN
    DROP DATABASE [pvs_merit_db];
    PRINT '✅ Dropped [pvs_merit_db]';
END

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'pvs_db')
BEGIN
    DROP DATABASE [pvs_db];
    PRINT '✅ Dropped [pvs_db]';
END

-- 3. Drop the Login
IF EXISTS (SELECT name FROM sys.server_principals WHERE name = 'pvs_user')
BEGIN
    DROP LOGIN [pvs_user];
    PRINT '✅ Dropped Login [pvs_user]';
END

PRINT '==========================================================';
PRINT 'SUCCESS: All PVS data has been wiped.';
PRINT 'You can now run 01, 02, and 03 for a fresh start.';
PRINT '==========================================================';
GO
