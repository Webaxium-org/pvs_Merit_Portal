# Database Not Visible in SSMS - Solution

## Problem
After running the setup script, the database `pvs_merit_db` was created successfully (you saw the confirmation message), but it's not visible in SQL Server Management Studio (SSMS).

## Solution

### Step 1: Refresh SSMS
1. In SSMS, locate the **Databases** folder in Object Explorer (left panel)
2. **Right-click** on **Databases**
3. Click **Refresh** (or press F5)
4. The `pvs_merit_db` database should now appear

### Step 2: If Still Not Visible - Check Connection
Make sure you're connected to the correct SQL Server instance:
1. Look at the top of Object Explorer - check the server name
2. It should match your SQL Server instance (e.g., `localhost`, `.\SQLEXPRESS`, etc.)
3. If you have multiple SQL Server instances, make sure you're connected to the right one

### Step 3: Verify Database Exists
Run this query in SSMS to confirm the database exists:
```sql
SELECT name FROM sys.databases WHERE name = 'pvs_merit_db';
```

If it returns `pvs_merit_db`, the database exists.

### Step 4: Check Which Server the Database Was Created On
Run this to see your current server:
```sql
SELECT @@SERVERNAME AS CurrentServer;
```

## Next Steps

Once you can see the database in SSMS, continue with the setup:

### Option 1: Complete Setup (Recommended)
```bash
cd server
npm run merit:setup
```
This will:
- Create all tables in the database
- Create the HR user with credentials

### Option 2: Just Verify Everything
```bash
cd server
npm run merit:verify
```
This will check if the HR user exists and show all users in the database.

## Common Issues

### Issue: "Database already exists" but can't see it
**Solution:** You're likely connected to a different SQL Server instance. Check your connection.

### Issue: Permission denied
**Solution:** Make sure you're running SSMS as Administrator and connected with admin privileges (sa or Windows Authentication with admin rights).

### Issue: Multiple SQL Server instances
**Solution:**
- Check your `.env` file - what is `SQL_SERVER_HOST`?
- Connect to that exact instance in SSMS
- Common instances: `localhost`, `.\SQLEXPRESS`, `localhost\SQLEXPRESS`, `(local)`
