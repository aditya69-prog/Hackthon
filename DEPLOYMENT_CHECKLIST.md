# MongoDB + Vercel Deployment Checklist

## Quick Reference: What Was Done ✅

### Files Created:
- ✅ `.env.production` - Backend production variables
- ✅ `client/.env.production` - Frontend production variables
- ✅ `client/.env.development` - Frontend development variables
- ✅ `vercel.json` - Vercel configuration
- ✅ `MONGODB_VERCEL_DEPLOYMENT.md` - Complete deployment guide

### Files Updated:
- ✅ `client/src/services/api.js` - Environment variable support
- ✅ `client/vite.config.js` - Environment variable handling

---

## Your Next Steps (5 Easy Steps)

### Step 1: Setup MongoDB Atlas (5 minutes)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user
5. Whitelist IP (0.0.0.0/0)
6. Copy connection string
   → mongodb+srv://username:password@cluster.mongodb.net/rnsitmate
```

### Step 2: Deploy Backend to Render (10 minutes)
```
1. Go to https://render.com
2. Sign up with GitHub
3. Create Web Service
   - Repository: rnsitmate
   - Name: rnsitmate-server
   - Build: npm install
   - Start: npm run start:prod --workspace=server
   - Plan: Free
4. Add environment variables (see .env.production)
5. Deploy (wait 2-3 minutes)
6. Copy backend URL: https://rnsitmate-server.onrender.com
```

### Step 3: Update Frontend .env.production (2 minutes)
```
Edit: client/.env.production
Set: VITE_API_URL=https://rnsitmate-server.onrender.com
```

### Step 4: Push to GitHub (2 minutes)
```powershell
git add .
git commit -m "Deploy: MongoDB and Render backend setup"
git push
```

### Step 5: Verify Deployment (5 minutes)
```
1. Test backend: https://rnsitmate-server.onrender.com/health
2. Check frontend: https://hackthon-client.vercel.app
3. Test signup flow
4. Check Render logs
5. Check MongoDB for data
```

---

## Important URLs After Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://hackthon-client.vercel.app | Your app |
| Backend | https://rnsitmate-server.onrender.com | API server |
| MongoDB | https://cloud.mongodb.com | Database admin |
| Render | https://render.com/dashboard | Backend monitoring |
| Vercel | https://vercel.com/dashboard | Frontend monitoring |

---

## Credentials to Keep Safe

```
MongoDB:
- Username: rnsitmate-user
- Password: [Save this!]

JWT Secret: [Generated - save in Render env vars]

Backend URL: https://rnsitmate-server.onrender.com
```

---

## Daily Monitoring

1. **Render Dashboard**: Check if service is running
2. **Logs**: Look for any errors
3. **MongoDB Atlas**: Check data storage usage
4. **Vercel Analytics**: Monitor frontend performance

---

## If Something Goes Wrong

### Backend not responding?
- Check Render logs
- Verify MONGO_URI is correct
- Restart service on Render

### Signup not working?
- Check CORS_ORIGINS in Render env
- Look at backend logs for errors
- Test MongoDB connection

### Data not saving?
- Verify MongoDB user password
- Check MONGO_URI in Render
- Look at database in MongoDB Atlas

---

## File Reference

Your setup files are located at:
- **Backend config**: `.env.production`
- **Frontend config**: `client/.env.production`, `client/.env.development`
- **Vercel config**: `vercel.json`
- **Full guide**: `MONGODB_VERCEL_DEPLOYMENT.md`
- **Original docs**: `DEPLOYMENT.md`, `PRODUCTION_READY.md`

---

## Cost (Monthly)

- MongoDB: FREE (512 MB)
- Render: FREE (sleeps after 15 min)
- Vercel: FREE (generous limits)
- **Total**: $0 ✅

---

**You're all set!** Follow the 5 steps above to deploy. Good luck! 🚀
