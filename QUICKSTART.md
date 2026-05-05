# Quick Start - Production Deployment

## 🚀 Deploy in 5 Minutes

### Step 1: Prepare Environment
```bash
# Copy and configure environment file
cp .env.example .env
# Edit .env with your values:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Random secret key
# - CORS_ORIGINS: Your domain
```

### Step 2: Build & Deploy

**Option A: Docker (Easiest)**
```bash
docker-compose up -d
# App ready at http://localhost:5000
```

**Option B: Node.js Server**
```bash
npm install
npm run build
npm run start:prod --workspace=server
# App ready at http://localhost:5000
```

**Option C: Heroku**
```bash
git push heroku main
# App deployed automatically
```

**Option D: PM2 (Production Manager)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Visit `http://yourdomain.com/` - should see landing page
- [ ] Click "Sign Up" / "Log In" - routing works
- [ ] Check `http://yourdomain.com/api/health` - API responds
- [ ] Open browser dev tools → Network → try logging in
- [ ] Check WebSocket connection in Network tab

## 📊 What Got Deployed

```
dist/
├── index.html (1.19 KB)
├── assets/
│   ├── index-*.js (63 KB - app code)
│   ├── vendor-react-*.js (237 KB - React)
│   ├── vendor-common-*.js (122 KB - other libs)
│   ├── vendor-http-*.js (41 KB - axios)
│   ├── vendor-ui-*.js (34 KB - framer-motion, lucide)
│   ├── vendor-socket-*.js (18 KB - socket.io)
│   └── index-*.css (12 KB - styles)
└── Combined: ~527 KB (gzipped: ~170 KB)
```

## 🔒 Security Enabled

- ✅ CORS restricted to your domain
- ✅ Security headers configured
- ✅ Rate limiting active
- ✅ JWT authentication
- ✅ HTTPS ready (needs SSL cert)
- ✅ Error messages sanitized

## 🆘 Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection fails:**
- Verify MONGO_URI is correct
- Check MongoDB is running
- Whitelist your IP in MongoDB Atlas

**Build fails:**
```bash
npm install        # Reinstall deps
npm run build      # Try build again
```

## 📈 Performance

- **JS Payload**: 170 KB gzipped (compared to 511 KB before)
- **CSS**: 3.4 KB gzipped
- **Total**: ~174 KB gzipped
- **Load Time**: ~1-2 seconds on 4G

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed platform-specific guides
- Environment variables reference
- Database setup
- Monitoring setup
- Troubleshooting guide

---

**Status**: ✅ Production Ready
**Last Verified**: May 5, 2026
