# Test API Connection

## The Problem
You're getting "Not Found - /v2/auth/login" error. This means either:
1. The backend server is not running
2. The URL path is incorrect
3. The routes are not registered properly

## Step-by-Step Testing

### Step 1: Make Sure Backend Server is Running

Open a terminal in the server directory and run:
```bash
cd server
npm run dev
```

**Expected output:**
```
========================================
Server is running in development mode
Port: 4000
URL: http://localhost:4000
========================================
```

**Keep this terminal open!** The server needs to stay running.

### Step 2: Test the Health Endpoint

Open a **new terminal** or use your browser:

**Option A: Using Browser**
- Open: http://localhost:4000/health
- You should see: `{"success":true,"message":"Server is healthy"}`

**Option B: Using PowerShell**
```powershell
Invoke-WebRequest -Uri http://localhost:4000/health -UseBasicParsing
```

**Option C: Using curl (if installed)**
```bash
curl http://localhost:4000/health
```

### Step 3: Test the Login Endpoint

**Using PowerShell:**
```powershell
$body = @{
    email = "hr@pvschemicals.com"
    password = "abc123xyz"
    authMethod = "local"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/v2/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Expected Response:**
- Status: 200 OK
- Body: JSON with user data and token

**If you get an error:**
- 404 Not Found = Routes not registered (need to check server code)
- Connection refused = Server not running
- CORS error = Server running but CORS issue

### Step 4: Check Server Logs

When the server is running, look at the terminal output. You should see:
- Database connection messages
- Route registration messages
- Any errors

### Step 5: Verify Routes Are Registered

With the server running, check the server logs. Add this temporarily to see registered routes:

## Common Issues & Solutions

### Issue 1: Server Not Running
**Solution:** Start the server with `npm run dev` in the server directory

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::4000`
**Solution:**
- Another process is using port 4000
- Kill the process or change the port in `.env`
- On Windows: `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`

### Issue 3: Wrong URL in Frontend
**Solution:** Check `client/.env.development`:
```env
VITE_API_URL=http://localhost:4000/api
```

### Issue 4: Server Running on Different Port
**Solution:** Check `server/.env` for `PORT=4000`

### Issue 5: CORS Error
**Solution:** Check `server/.env` has:
```env
CLIENT_URL=http://localhost:5173
```

## Quick Debug Checklist

- [ ] Backend server is running (`npm run dev` in server folder)
- [ ] Server shows "Server is running" message
- [ ] http://localhost:4000/health returns success
- [ ] http://localhost:4000/api/v2/auth/login endpoint exists
- [ ] Frontend is running (`npm run dev` in client folder)
- [ ] Frontend `.env.development` has correct API URL
- [ ] No CORS errors in browser console (F12)

## Still Not Working?

Share:
1. Full server console output when you run `npm run dev`
2. Browser console errors (F12 > Console tab)
3. Network tab response (F12 > Network tab > click the failed request)
