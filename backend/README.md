# News App Backend Server

A Node.js/Express backend server that provides a RESTful API for news data. This server simulates a news API and can be easily extended to connect with real news sources.

## Features

- ✅ Top Headlines endpoint with pagination
- ✅ Search articles functionality
- ✅ Category-based filtering
- ✅ CORS enabled for Flutter app integration
- ✅ JSON responses compatible with Flutter

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

This will install:
- `express` - Web framework for Node.js
- `cors` - Enable Cross-Origin Resource Sharing

## Running the Server

Start the server with:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Expected Output
```
🚀 News App Backend Server is running on http://localhost:3000

Available endpoints:
  - Health Check: http://localhost:3000/api/health
  - Top Headlines: http://localhost:3000/api/news/top-headlines
  - Search: http://localhost:3000/api/news/search?q=technology
  - Category: http://localhost:3000/api/news/category/business
  - All Articles: http://localhost:3000/api/news/all

Press Ctrl+C to stop the server
```

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

### 2. Top Headlines
```
GET /api/news/top-headlines?page=1&pageSize=20
```
Fetch top news articles with pagination.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Articles per page, max 100 (default: 20)

**Response:**
```json
{
  "status": "ok",
  "totalResults": 8,
  "articles": [
    {
      "source": { "id": "techcrunch", "name": "TechCrunch" },
      "author": "Sarah Chen",
      "title": "AI Breakthrough: New Model Achieves Human-Level Performance",
      "description": "...",
      "url": "...",
      "urlToImage": "...",
      "publishedAt": "2026-05-05T10:30:00Z",
      "content": "..."
    }
    // ... more articles
  ],
  "pageSize": 20,
  "currentPage": 1,
  "totalPages": 1
}
```

### 3. Search Articles
```
GET /api/news/search?q=technology&page=1&pageSize=20
```
Search articles by keyword.

**Query Parameters:**
- `q` (required) - Search query
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Articles per page (default: 20)

### 4. Articles by Category
```
GET /api/news/category/:category?page=1&pageSize=20
```
Fetch articles by category.

**URL Parameters:**
- `category` - News category (business, sports, health, tech, etc.)

### 5. Get Single Article
```
GET /api/news/article/:id
```
Fetch a specific article by ID.

**URL Parameters:**
- `id` - Article index (0-based)

### 6. Get All Articles
```
GET /api/news/all
```
Fetch all articles without pagination.

## Integrating with Flutter App

The Flutter app has been updated to use this backend server. Update the base URL in `lib/news_api_service.dart`:

```dart
final String baseUrl = 'http://YOUR_SERVER_IP:3000/api';
```

For local development on an emulator:
- Use `http://10.0.2.2:3000/api` (Android emulator)
- Use `http://localhost:3000/api` (iOS simulator or Chrome)

## Extending the Backend

To add real news data integration, replace the `sampleNews` array with API calls to services like:
- NewsAPI.org
- Guardian API
- NY Times API
- BBC News API

Example:
```javascript
const fetch = require('node-fetch');

// In your endpoint handler:
const response = await fetch(`https://api.newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_KEY`);
const data = await response.json();
res.json(data);
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the `PORT` variable in `server.js`:
```javascript
const PORT = 3001; // or any available port
```

### CORS Issues
CORS is already enabled for all origins. If you have issues, modify the CORS settings in `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Specific origin
  credentials: true
}));
```

### Server Not Responding
Ensure:
1. Node.js is installed: `node --version`
2. Dependencies are installed: `npm install`
3. Server is running without errors
4. Firewall is not blocking port 3000

## Files

- `server.js` - Main server file with all endpoints
- `package.json` - Project configuration and dependencies
- `README.md` - This file

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- User authentication and accounts
- Favorites/Bookmarks functionality
- Multiple news source support
- Caching mechanism
- Rate limiting
- Logging and monitoring
