# Deployment Guide for RNS Connect

## Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- npm/yarn package manager

## Environment Setup

1. **Create `.env` file from `.env.example`:**
   ```bash
   cp .env.example .env
   ```

2. **Update environment variables:**
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_random_string
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   NODE_ENV=production
   ```

## Build for Production

### Option 1: Local Deployment

```bash
# Install dependencies
npm install

# Build the client
npm run build

# Start the server in production
npm run start:prod --workspace=server
```

The server will:
- Serve the client build from `client/dist`
- Listen on port 5000
- Automatically handle client-side routing

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the app at http://localhost:5000
```

### Option 3: Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set CORS_ORIGINS=https://your-app-name.herokuapp.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 4: Railway/Render/Vercel Deployment

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Deploy automatically on git push

## Database Setup

### MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### Seed Initial Data
```bash
npm run seed --workspace=server
```

## Security Checklist

- [x] Environment variables configured
- [x] CORS properly restricted to your domain
- [x] JWT secret set to random value
- [x] MongoDB password protected
- [x] HTTPS enabled on production domain
- [x] Rate limiting enabled
- [x] Security headers added
- [x] Error messages don't leak sensitive info

## Monitoring & Maintenance

1. **Health Check Endpoint:**
   ```
   GET /api/health
   ```

2. **Logs:**
   - Server logs in console/platform logs
   - Enable monitoring in your hosting platform

3. **Database Backups:**
   - Enable automatic backups in MongoDB Atlas
   - Regular exports recommended

## Performance Tips

1. The client is built with code splitting - chunks load on demand
2. API requests are rate-limited to prevent abuse
3. Static files are served with caching headers
4. WebSocket connections optimized for real-time chat

## Troubleshooting

**Port already in use:**
```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection fails:**
- Check MONGO_URI is correct
- Verify MongoDB is running
- Check IP whitelist in MongoDB Atlas

**CORS errors:**
- Verify CORS_ORIGINS includes your domain
- Include port if not standard (80/443)
- Check WebSocket proxy configuration

## Production Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificate installed
- [ ] Rate limiting tested
- [ ] CORS origins correct
- [ ] Error handling working
- [ ] Monitoring setup
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] User acceptance testing done
