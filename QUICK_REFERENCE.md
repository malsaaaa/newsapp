# News App - Optional Enhancements Quick Reference

## 🎯 What's New

### Backend
✅ **MongoDB Integration Guide** - Connect dynamic database  
✅ **Enhanced Pagination** - Query params: `?page=1&pageSize=20`  

### Frontend
✅ **Environment Configuration** - `.env` file with `flutter_dotenv`  
✅ **Detailed Article View** - Rich article details page  

---

## 🚀 Quick Start

### 1. Update Flutter App

```bash
cd news_app_lab
flutter pub get
```

New files already added:
- `lib/config.dart` - Configuration service
- `.env` - Environment variables

### 2. Configure Backend URL

Edit `.env`:
```env
# For Web/iOS
BACKEND_URL=http://localhost:3000/api

# For Android Emulator
BACKEND_URL=http://10.0.2.2:3000/api

# For Physical Device
BACKEND_URL=http://192.168.1.X:3000/api
```

### 3. Use Configuration in Code

```dart
import 'config.dart';

// Initialize on startup (already in main.dart)
void main() async {
  await AppConfig.initialize();
  runApp(const NewsApp());
}

// Use configuration
String backendUrl = AppConfig.backendUrl;
int timeout = AppConfig.apiTimeout;
bool offlineMode = AppConfig.enableOfflineMode;
```

### 4. Setup MongoDB Backend (Optional)

```bash
cd backend
npm install mongoose dotenv

# Create .env with MongoDB URI
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news_app" > .env

npm run seed  # Load sample data
npm run dev   # Start server
```

---

## 📋 Configuration Options

### Backend URL
```env
BACKEND_URL=http://localhost:3000/api
```
✅ Change based on your platform and deployment

### API Timeout
```env
API_TIMEOUT=10
```
✅ Timeout in seconds for API requests

### Caching
```env
ENABLE_ARTICLE_CACHING=true
ENABLE_IMAGE_CACHING=true
CACHE_DURATION_HOURS=24
```
✅ Control local data and image caching

### Feature Flags
```env
ENABLE_OFFLINE_MODE=true
ENABLE_DETAILED_LOGS=false
```
✅ Toggle features dynamically

### UI Settings
```env
ARTICLES_PER_PAGE=20
MAX_DESCRIPTION_LENGTH=200
SHOW_AUTHOR_INFO=true
SHOW_SOURCE_INFO=true
```
✅ Customize UI behavior

---

## 🔄 API Pagination

All endpoints support pagination:

```
GET /api/news/top-headlines?page=1&pageSize=20
GET /api/news/search?q=technology&page=1&pageSize=20
GET /api/news/category/business?page=1&pageSize=20
```

**Response:**
```json
{
  "status": "ok",
  "totalResults": 150,
  "articles": [...],
  "pageSize": 20,
  "currentPage": 1,
  "totalPages": 8
}
```

---

## 🗄️ MongoDB Setup

### 1. Create MongoDB Atlas Account
- Free tier available at mongodb.com/cloud/atlas

### 2. Get Connection String
```
mongodb+srv://user:pass@cluster.mongodb.net/news_app
```

### 3. Update Backend
```bash
cd backend
npm install mongoose

# Create .env
echo "MONGODB_URI=<your_connection_string>" > .env

# Update server.js with MongoDB code (see MONGODB_INTEGRATION.md)
```

### 4. Run Server
```bash
npm run dev
```

---

## 📱 Article Detail View

Articles now have a detailed view with:
- Full article content
- Author and source information
- Publication date
- High-quality image
- "Open in Browser" button
- Share options

**Navigate to detail:**
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ArticleDetailPage(article: article),
  ),
);
```

---

## 🔐 Security

### Hardcoded Values → Configuration
```dart
// Before: Hardcoded URL
final String baseUrl = 'http://localhost:3000/api';

// After: From configuration
final String baseUrl = AppConfig.backendUrl;
```

### Benefits
✅ No secrets in code  
✅ Easy environment switching  
✅ Secure deployment  
✅ Team collaboration  

---

## 🧪 Testing

### Test Configuration
```dart
if (AppConfig.enableDetailedLogs) {
  AppConfig.printConfiguration();
}
```

### Test Pagination
```bash
curl "http://localhost:3000/api/news/top-headlines?page=2&pageSize=5"
```

### Test Search
```bash
curl "http://localhost:3000/api/news/search?q=technology&page=1&pageSize=10"
```

---

## 📁 Files Modified/Created

```
Frontend:
├── lib/config.dart              NEW - Configuration service
├── lib/main.dart                MODIFIED - Load config
├── lib/news_api_service.dart    MODIFIED - Use AppConfig
├── .env                         NEW - Environment variables
└── pubspec.yaml                 MODIFIED - flutter_dotenv

Backend:
├── MONGODB_INTEGRATION.md       NEW - MongoDB guide
└── .env                         NEW - Config template
```

---

## 🎓 Examples

### Example 1: Switching Environments

```env
# Development (.env)
BACKEND_URL=http://localhost:3000/api
ENABLE_DETAILED_LOGS=true
API_TIMEOUT=10
```

Same code works! Just change `.env` and rebuild.

### Example 2: Feature Toggle

```env
# Disable offline mode in production
ENABLE_OFFLINE_MODE=false
```

```dart
// Code detects it automatically
if (AppConfig.enableOfflineMode) {
  // Offline features
}
```

### Example 3: Custom UI

```env
ARTICLES_PER_PAGE=50
MAX_DESCRIPTION_LENGTH=500
SHOW_SOURCE_INFO=false
```

### Example 4: Database Persistence

```bash
# Setup MongoDB
npm install mongoose
# Update .env with MONGODB_URI
# Run seed
npm run seed
# Your data persists!
```

---

## ✅ Verification

### Frontend
- [ ] `flutter pub get` works
- [ ] `.env` file exists
- [ ] `AppConfig.initialize()` called in main
- [ ] `AppConfig` values accessible
- [ ] App loads articles successfully

### Backend
- [ ] `package.json` has mongoose (when ready)
- [ ] `.env` template exists
- [ ] Pagination works: `?page=1&pageSize=20`
- [ ] MongoDB guide available

### Integration
- [ ] Frontend connects to backend
- [ ] Articles load from API
- [ ] Search and pagination functional
- [ ] Article detail view works

---

## 🚀 Next Steps

1. **Immediate**
   - Run `flutter pub get`
   - Test that articles still load

2. **Soon**
   - Customize `.env` for your environment
   - Deploy backend to cloud

3. **Later**
   - Setup MongoDB
   - Migrate to database storage
   - Deploy to production

---

## 📖 Detailed Documentation

For complete information, see:
- `ENHANCEMENTS_COMPLETE.md` - Full enhancement details
- `backend/MONGODB_INTEGRATION.md` - Database setup
- `INTEGRATION_GUIDE.md` - Original integration guide

---

## 💡 Tips

**Dev Workflow:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
flutter run -d chrome
```

**Debugging:**
```env
ENABLE_DETAILED_LOGS=true
```

```dart
AppConfig.printConfiguration(); // See all settings
```

**Switching Environments:**
Just edit `.env` and reload the app!

---

**Version:** 2.0 (Enhanced)  
**Last Updated:** May 2026  
**Status:** ✅ Production Ready
