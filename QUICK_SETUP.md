# Quick Database Setup - Fix Login Error

You're getting the error: **"Login failed for user 'pvs_user'"**

This means the SQL Server login doesn't exist yet. Here's how to fix it:

---

## Option 1: Create the SQL Server Login (Recommended)

### Step 1: Open SQL Server Management Studio (SSMS)
- Connect using **Windows Authentication** or **sa** account

### Step 2: Run the Login Setup Script
1. In SSMS, click **File** > **Open** > **File**
2. Navigate to: `server/src/scripts/createSQLLogin.sql`
3. Click **Execute** (F5)

This will:
- Create the `pvs_user` login with password `PVSChemicals@2025Secure`
- Create the `pvs_merit_db` database
- Grant necessary permissions

### Step 3: Check if SQL Server Authentication is Enabled
1. In SSMS, right-click your server name > **Properties**
2. Go to **Security** tab
3. Make sure **"SQL Server and Windows Authentication mode"** is selected
4. If you changed this, **restart SQL Server service**:
   - Open **Services** (Windows Key + R, type `services.msc`)
   - Find **SQL Server (MSSQLSERVER)** or **SQL Server (SQLEXPRESS)**
   - Right-click > **Restart**

### Step 4: Run the Application Setup
```bash
cd server
npm run merit:setup
```

---

## Option 2: Use Windows Authentication (Alternative)

If you don't want to create a SQL login, use Windows Authentication instead.

### Update your `.env` file:

Change these lines:
```env
# Instead of:
SQL_SERVER_USER=pvs_user
SQL_SERVER_PASSWORD=PVSChemicals@2025Secure

# Use Windows Authentication (leave these commented or remove):
# SQL_SERVER_USER=
# SQL_SERVER_PASSWORD=
```

### Update the database config file:

The app needs to detect when to use Windows Authentication. Check if `src/config/sqlDatabase.js` handles empty credentials.

---

## Option 3: Use 'sa' Account (Development Only)

**WARNING: Only use for local development!**

Update your `.env` file:
```env
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourSaPassword
```

Then run:
```bash
npm run merit:setup
```

---

## Verification Steps

After setup, verify the login works:

### In SSMS:
```sql
-- Check if login exists
SELECT name, type_desc FROM sys.server_principals WHERE name = 'pvs_user';

-- Check database access
USE pvs_merit_db;
SELECT USER_NAME();
```

### Test Connection:
```bash
cd server
npm run merit:init
```

You should see: ✅ Database connection successful!

---

## Common Issues

### Issue: "Login failed for user 'pvs_user'"
**Solution:** Run `createSQLLogin.sql` in SSMS

### Issue: "Cannot open database"
**Solution:** Make sure the database was created. Run:
```sql
CREATE DATABASE pvs_merit_db;
```

### Issue: SQL Server Authentication not enabled
**Solution:**
1. SSMS > Right-click server > Properties > Security
2. Select "SQL Server and Windows Authentication mode"
3. Restart SQL Server service

### Issue: Password policy error
**Solution:** The password needs to meet SQL Server requirements:
- At least 8 characters
- Contains uppercase, lowercase, numbers, and symbols

---

## Next Steps

Once the database connection works:

1. ✅ Database tables will be created automatically
2. ✅ HR user will be seeded with:
   - Email: `hr@pvschemicals.com`
   - Password: `abc123xyz`
3. ✅ Start the app: `npm run dev`
4. ✅ Login with HR credentials

---

## Need Help?

Check the full documentation in `DATABASE_SETUP.md` for detailed troubleshooting.
