-- ============================================================================
-- Migration Script: Create Merit Settings Table
-- Description: Creates the MeritSettings table for storing configurable
--              merit year and budget percentage with full audit history
-- Author: System Migration
-- Date: 2025-01-XX
-- ============================================================================

-- Step 1: Create MeritSettings table
-- This table stores all merit configuration settings with history
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MeritSettings')
BEGIN
    CREATE TABLE [dbo].[MeritSettings] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [meritYear] INT NOT NULL,
        [budgetPercentage] DECIMAL(5, 2) NOT NULL,
        [isActive] BIT NOT NULL DEFAULT 1,
        [createdBy] INT NOT NULL,
        [createdByName] NVARCHAR(200) NOT NULL,
        [notes] NVARCHAR(MAX) NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),

        -- Foreign key constraint
        CONSTRAINT FK_MeritSettings_CreatedBy FOREIGN KEY ([createdBy])
            REFERENCES [dbo].[Employees]([id])
            ON DELETE NO ACTION,

        -- Check constraints for data validation
        CONSTRAINT CHK_MeritSettings_Year CHECK ([meritYear] >= 2025 AND [meritYear] <= 2030),
        CONSTRAINT CHK_MeritSettings_Percentage CHECK ([budgetPercentage] >= 0 AND [budgetPercentage] <= 100)
    );

    PRINT 'Table [MeritSettings] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [MeritSettings] already exists. Skipping creation.';
END
GO

-- Step 2: Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MeritSettings_IsActive')
BEGIN
    CREATE INDEX IX_MeritSettings_IsActive ON [dbo].[MeritSettings]([isActive]);
    PRINT 'Index IX_MeritSettings_IsActive created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MeritSettings_MeritYear')
BEGIN
    CREATE INDEX IX_MeritSettings_MeritYear ON [dbo].[MeritSettings]([meritYear]);
    PRINT 'Index IX_MeritSettings_MeritYear created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MeritSettings_CreatedBy')
BEGIN
    CREATE INDEX IX_MeritSettings_CreatedBy ON [dbo].[MeritSettings]([createdBy]);
    PRINT 'Index IX_MeritSettings_CreatedBy created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MeritSettings_CreatedAt')
BEGIN
    CREATE INDEX IX_MeritSettings_CreatedAt ON [dbo].[MeritSettings]([createdAt]);
    PRINT 'Index IX_MeritSettings_CreatedAt created successfully.';
END
GO

-- Step 3: Insert default settings (2026, 3%) with HR user as creator
-- Find the HR user (hr@pvschemicals.com) to set as creator
DECLARE @hrUserId INT;
DECLARE @hrUserName NVARCHAR(200);

SELECT TOP 1
    @hrUserId = id,
    @hrUserName = fullName
FROM [dbo].[Employees]
WHERE email = 'hr@pvschemicals.com'
    OR role = 'hr'
ORDER BY
    CASE WHEN email = 'hr@pvschemicals.com' THEN 0 ELSE 1 END,
    id ASC;

-- Only insert default if no settings exist
IF NOT EXISTS (SELECT 1 FROM [dbo].[MeritSettings])
BEGIN
    IF @hrUserId IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[MeritSettings] (
            [meritYear],
            [budgetPercentage],
            [isActive],
            [createdBy],
            [createdByName],
            [notes],
            [createdAt],
            [updatedAt]
        )
        VALUES (
            2026,                                   -- meritYear
            3.00,                                    -- budgetPercentage (3%)
            1,                                       -- isActive
            @hrUserId,                              -- createdBy
            @hrUserName,                            -- createdByName
            'Initial default merit settings created by migration script', -- notes
            GETDATE(),                              -- createdAt
            GETDATE()                               -- updatedAt
        );

        PRINT 'Default merit settings (Year: 2026, Budget: 3%) inserted successfully.';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: No HR user found. Please manually insert default settings after creating an HR user.';
        PRINT 'Example SQL:';
        PRINT '  INSERT INTO [dbo].[MeritSettings] ([meritYear], [budgetPercentage], [isActive], [createdBy], [createdByName], [notes])';
        PRINT '  VALUES (2026, 3.00, 1, <HR_USER_ID>, ''<HR_USER_NAME>'', ''Initial settings'');';
    END
END
ELSE
BEGIN
    PRINT 'Merit settings already exist. Skipping default data insertion.';
END
GO

-- ============================================================================
-- End of Migration Script
-- ============================================================================
--
-- ROLLBACK SCRIPT (if needed):
-- To rollback this migration, run the following:
--
-- DROP TABLE IF EXISTS [dbo].[MeritSettings];
--
-- ============================================================================
PRINT 'Migration completed successfully!';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Verify the table was created: SELECT * FROM [dbo].[MeritSettings];';
PRINT '2. Check indexes: sp_helpindex ''MeritSettings'';';
PRINT '3. Restart your application to ensure the new model is loaded.';
GO
