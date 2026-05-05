# Complete MongoDB + Vercel Deployment Guide

## Architecture
- **Frontend**: React/Vite → Vercel ✅ (Already deployed)
- **Backend**: Node.js/Express → Render.com (for WebSockets support)
- **Database**: MongoDB Atlas (cloud)

---

## Part 1: MongoDB Atlas Setup (FREE)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google/GitHub or email
4. Create a new project (name it "rnsitmate")

### Step 2: Create a Cluster
1. Click "Create" → "Build a Database"
2. Choose **M0 Free Tier** (free forever)
3. Select region closest to you (AWS/Azure/Google)
4. Click "Create Cluster" (takes ~3-5 minutes)

### Step 3: Get Connection String
1. Once cluster is created, click "Connect"
2. Choose "Drivers" → select "Node.js" → version "5.9 or later"
3. You'll see connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>`, `<password>`, and database name

### Step 4: Create Database User
1. Go to "Security" → "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username: `rnsitmate-user`
5. Create strong password (save it!)
6. Click "Add User"

### Step 5: Whitelist IP Address
1. Go to "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production: add specific IPs
4. Click "Confirm"

### Step 6: Copy Your Connection String
```
mongodb+srv://rnsitmate-user:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rnsitmate?retryWrites=true&w=majority
```

---

## Part 2: Deploy Backend to Render.com (FREE)

### Step 1: Prepare Your Code
Push your latest code to GitHub:
```powershell
git add .
git commit -m "Setup: Add production environment configuration"
git push
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend Service
1. Click "New" → "Web Service"
2. Select your `rnsitmate` repository
3. **Configure:**
   - **Name**: `rnsitmate-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod --workspace=server`
   - **Plan**: `Free`

4. Click "Create Web Service"

### Step 4: Add Environment Variables to Render
1. Go to your service dashboard
2. Click "Environment"
3. Add these variables:

```
MONGO_URI=mongodb+srv://rnsitmate-user:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rnsitmate?retryWrites=true&w=majority

JWT_SECRET=generate_random_string_here

JWT_REFRESH_SECRET=generate_another_random_string_here

NODE_ENV=production

CORS_ORIGINS=https://hackthon-client.vercel.app,https://www.hackthon-client.vercel.app

PORT=10000

CLIENT_URL=https://hackthon-client.vercel.app

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

EMAIL_SERVICE=gmail

EMAIL_USER=your_email@gmail.com

EMAIL_PASSWORD=your_app_password
```

**To generate JWT secrets:**
```powershell
# Run in PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Click "Save" and wait for deployment (2-3 minutes)

### Step 5: Get Your Backend URL
Once deployed, you'll see URL like: `https://rnsitmate-server.onrender.com`

---

## Part 3: Update Frontend for Production

### Step 1: Update Backend URL
1. Edit `.env.production` in root:
```
VITE_API_URL=https://rnsitmate-server.onrender.com
```

### Step 2: Add Vercel Configuration
Already created `vercel.json` - no changes needed.

### Step 3: Push to GitHub
```powershell
git add .
git commit -m "Deploy: Configure backend URL and Vercel settings"
git push
```

### Step 4: Vercel Auto-Deploys
Vercel automatically redeploys when you push to GitHub (takes 1-3 minutes)

---

## Part 4: Testing

### Test 1: Check Backend is Running
Visit: `https://rnsitmate-server.onrender.com/health`
Should see: `{"status":"ok"}`

### Test 2: Check Frontend is Updated
Visit: `https://hackthon-client.vercel.app`

### Test 3: Test Signup
1. Go to signup page
2. Fill all fields
3. Should connect to MongoDB and send OTP
4. Check backend logs on Render dashboard

### Test 4: Check Render Logs
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Should see MongoDB connection message

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured
- [ ] Render backend deployed
- [ ] All environment variables set correctly
- [ ] Frontend environment variables updated
- [ ] Backend URL is correct
- [ ] CORS origins configured
- [ ] Tested signup flow end-to-end
- [ ] Checked logs for errors
- [ ] Verified MongoDB has data

---

## Troubleshooting

### Issue: "MongoDB connection failed"
**Solution:**
1. Check `MONGO_URI` is correct (copy from Atlas again)
2. Verify database user password is correct
3. Check IP whitelist includes Render's IP (use 0.0.0.0/0)
4. Test connection string locally first

### Issue: "CORS error when signing up"
**Solution:**
1. Verify `CORS_ORIGINS` matches your Vercel URL
2. Restart Render service after changing env variables
3. Check backend logs for actual error

### Issue: "API not responding"
**Solution:**
1. Check if Render service is running (should be "Live")
2. If free plan, service sleeps after 15 min inactivity
3. Visit backend URL to wake it up: `https://rnsitmate-server.onrender.com`

### Issue: "Signup OTP not sending"
**Solution:**
1. Check EMAIL_SERVICE environment variables
2. For Gmail: use App Password, not regular password
3. Check Render logs for email errors

---

## MongoDB Data Management

### Access MongoDB Data
1. Go to MongoDB Atlas dashboard
2. Click "Collections"
3. Click database name
4. See all collections: Users, Messages, Matches, etc.

### Backup Data
1. Click "Backup"
2. Click "Restore" to backup manually
3. Automatic backups happen daily on free tier

### Scale if Needed
1. Free tier: 512 MB storage (usually enough for ~100K users)
2. If reaching limit: upgrade to M2/M5 cluster
3. Upgrade process is gradual (no downtime)

---

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| MongoDB Atlas | FREE | Up to 512 MB |
| Render | FREE | Sleeps after 15 min inactivity |
| Vercel | FREE | Generous free tier |
| **Total** | **FREE** | ✅ No costs for starter phase |

**Note**: When you get more users, upgrade to paid tiers (usually $10-30/month)

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test end-to-end
4. ✅ Monitor logs
5. **Monitor**: Check Render dashboard weekly
6. **Scale**: If users increase, upgrade plans
7. **Optimize**: Enable caching, CDN, etc.

---

## Support & Documentation

- **MongoDB**: https://docs.mongodb.com/atlas/
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Your Deployment Files**: Check `DEPLOYMENT.md`, `PRODUCTION_READY.md`

