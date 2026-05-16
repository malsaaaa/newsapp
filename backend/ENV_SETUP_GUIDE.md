# Backend .env Setup Guide

## Quick Start

### 1. The .env file is already created!

```
backend/.env
```

Current configuration:
- **PORT:** 3000
- **NODE_ENV:** development
- **MONGODB_URI:** mongodb://localhost:27017/news_app (local MongoDB)

### 2. Options for MongoDB

#### Option A: Local MongoDB (Development)
```env
MONGODB_URI=mongodb://localhost:27017/news_app
```

**Setup:**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Server will use local database

#### Option B: MongoDB Atlas (Cloud - Recommended)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/news_app?retryWrites=true&w=majority
```

**Setup:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (M0 free tier)
4. Click "Connect"
5. Choose "Connect your application"
6. Copy connection string
7. Replace `username` and `password`
8. Paste into `.env`

### 3. Other Configuration Options

```env
# Server Port
PORT=3000

# Environment (development/production)
NODE_ENV=development

# Debug Logging
ENABLE_DEBUG_LOGS=true

# Load sample data if empty
ENABLE_SAMPLE_DATA=true

# CORS Settings
CORS_ORIGIN=*

# API Defaults
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

### 4. Environment-Specific Setup

**Development (.env):**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/news_app
ENABLE_DEBUG_LOGS=true
ENABLE_SAMPLE_DATA=true
```

**Production (.env):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/news_app
ENABLE_DEBUG_LOGS=false
ENABLE_SAMPLE_DATA=false
```

### 5. Start the Server

```bash
# Using current .env
npm start

# Or with nodemon (auto-reload)
npm run dev
```

### 6. Verify Configuration

```bash
# Test the server
curl http://localhost:3000/api/health
# Expected: {"status":"ok","message":"Backend server is running"}

# Check if MongoDB is connected
curl http://localhost:3000/api/news/top-headlines
# Should return articles from MongoDB
```

---

## MongoDB Connection Issues

### Connection Refused (Local)
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. On Windows: Search "Services" > Start "MongoDB"

### Authentication Failed (Atlas)
```
Error: Invalid username [user], authentication failed
```

**Solution:**
1. Double-check username/password in connection string
2. Verify username in MongoDB Atlas > Database Access
3. Check IP whitelist: All IP is allowed (0.0.0.0/0)

### Invalid Connection String
```
Error: Invalid connection string
```

**Solution:**
1. Copy string directly from MongoDB Atlas
2. Don't manually type it
3. Verify format: `mongodb+srv://user:pass@...`

---

## File Reference

| File | Purpose |
|------|---------|
| `.env` | Current configuration (used by server) |
| `.env.example` | Reference template |
| `MONGODB_INTEGRATION.md` | Complete MongoDB guide |
| `server.js` | Server code (reads .env) |

---

## Next Steps

1. ✅ .env file created
2. Choose MongoDB (Local or Atlas)
3. Install MongoDB (if local)
4. Update MONGODB_URI in .env
5. Run: `npm start`
6. Test endpoints

---

## Tips

- **Never commit .env** - Add to .gitignore
- **Keep .env.example** - For team reference
- **Use strong passwords** - For production MongoDB
- **Whitelist IPs** - In MongoDB Atlas for security
- **Monitor logs** - Use ENABLE_DEBUG_LOGS in development

---

## Support

For MongoDB issues, see: `backend/MONGODB_INTEGRATION.md`

For server issues, check console output when running `npm start`
