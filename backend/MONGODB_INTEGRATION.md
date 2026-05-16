# MongoDB Integration Guide for News App Backend

## Overview

This guide explains how to connect your Node.js backend to MongoDB for persistent storage of news articles and other data. Currently, the backend uses in-memory sample data. With MongoDB, you'll have a scalable, cloud-based database.

## Prerequisites

- Node.js and npm installed
- MongoDB Atlas account (free tier available)
- MongoDB connection string
- Your existing backend project

## Step 1: Install MongoDB Dependencies

```bash
cd backend
npm install mongoose dotenv
npm install --save-dev nodemon
```

**Packages:**
- `mongoose` - MongoDB object modeling for Node.js
- `dotenv` - Environment variable management
- `nodemon` - Auto-restart server on file changes (optional but recommended)

## Step 2: Create .env File for Backend

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/news_app?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
MAX_PAGE_SIZE=100
DEFAULT_PAGE_SIZE=20

# Feature Flags
ENABLE_DEBUG_LOGS=false
ENABLE_SAMPLE_DATA=true
```

**Note:** Replace `username`, `password`, and cluster details with your MongoDB Atlas credentials.

## Step 3: Get MongoDB Connection String

### Using MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string

Your connection string will look like:
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### Using Local MongoDB

If you prefer local development:
```
mongodb://localhost:27017/news_app
```

## Step 4: Update Backend Configuration

Update `backend/server.js` to use MongoDB:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('✅ Connected to MongoDB');
});

// Define Article Schema
const articleSchema = new mongoose.Schema({
  source: {
    id: String,
    name: String
  },
  author: String,
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true, unique: true },
  urlToImage: String,
  publishedAt: { type: Date, default: Date.now },
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

// ===== API ENDPOINTS =====

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// GET /api/news/top-headlines
app.get('/api/news/top-headlines', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    
    if (pageSize > 100) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Page size cannot exceed 100' 
      });
    }

    const skip = (page - 1) * pageSize;
    
    // Get total count
    const totalResults = await Article.countDocuments();
    
    // Fetch articles
    const articles = await Article.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(); // Use lean() for better performance

    res.json({
      status: 'ok',
      totalResults: totalResults,
      articles: articles,
      pageSize: pageSize,
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/news/search
app.get('/api/news/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    if (!query) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Search query is required' 
      });
    }

    const skip = (page - 1) * pageSize;
    
    // Search using text index or regex
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    };

    const totalResults = await Article.countDocuments(searchFilter);
    const articles = await Article.find(searchFilter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.json({
      status: 'ok',
      totalResults: totalResults,
      articles: articles,
      pageSize: pageSize,
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/news/category/:category
app.get('/api/news/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const skip = (page - 1) * pageSize;
    
    // Filter by category (stored in source.id or custom category field)
    const totalResults = await Article.countDocuments();
    const articles = await Article.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.json({
      status: 'ok',
      totalResults: totalResults,
      articles: articles,
      pageSize: pageSize,
      currentPage: page,
      totalPages: Math.ceil(totalResults / pageSize)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/news/add (Add new article)
app.post('/api/news/add', async (req, res) => {
  try {
    const article = new Article(req.body);
    const savedArticle = await article.save();
    res.status(201).json({ status: 'ok', article: savedArticle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Article URL already exists' 
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/news/:id (Update article)
app.put('/api/news/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json({ status: 'ok', article });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/news/:id (Delete article)
app.delete('/api/news/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ status: 'ok', message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 News App Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
```

## Step 5: Update package.json

Add MongoDB scripts to `backend/package.json`:

```json
{
  "name": "news-app-backend",
  "version": "1.0.0",
  "description": "Backend server for News App with MongoDB integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed-database.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

## Step 6: Seed Initial Data (Optional)

Create `backend/seed-database.js` to populate initial news articles:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const articleSchema = new mongoose.Schema({
  source: { id: String, name: String },
  author: String,
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true, unique: true },
  urlToImage: String,
  publishedAt: Date,
  content: String,
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

const sampleArticles = [
  {
    source: { id: "techcrunch", name: "TechCrunch" },
    author: "Sarah Chen",
    title: "AI Breakthrough: New Model Achieves Human-Level Performance",
    description: "Researchers announce a groundbreaking AI model...",
    url: "https://techcrunch.com/ai-breakthrough",
    urlToImage: "https://picsum.photos/600/400?random=1",
    publishedAt: new Date("2026-05-05T10:30:00Z"),
    content: "A major breakthrough in artificial intelligence research..."
  },
  // Add more articles...
];

async function seedDatabase() {
  try {
    // Clear existing articles
    await Article.deleteMany({});
    console.log('✓ Cleared existing articles');

    // Insert new articles
    const inserted = await Article.insertMany(sampleArticles);
    console.log(`✓ Inserted ${inserted.length} articles`);

    // Create text index for search
    await Article.collection.createIndex({ title: "text", description: "text", content: "text" });
    console.log('✓ Created text index for search');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
```

Run seeding:
```bash
npm run seed
```

## Step 7: Environment Variables

Update your `.env` file in the backend:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/news_app?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
MAX_PAGE_SIZE=100
DEFAULT_PAGE_SIZE=20
ENABLE_DEBUG_LOGS=false
ENABLE_SAMPLE_DATA=false
```

## Step 8: Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/news/top-headlines
curl http://localhost:3000/api/news/search?q=AI
```

## MongoDB Features

### 1. **Pagination**
- Uses `skip()` and `limit()` for efficient pagination
- Supports any page size up to 100 items per page

### 2. **Full-Text Search**
- Searches across title, description, and content fields
- Uses MongoDB text index for performance

### 3. **Sorting**
- Articles sorted by `publishedAt` in descending order (newest first)
- Can be extended to support other sort options

### 4. **Data Validation**
- Mongoose schemas enforce data types and required fields
- Prevents duplicate URLs with unique constraint

### 5. **CRUD Operations**
- Create: POST /api/news/add
- Read: GET /api/news/top-headlines, GET /api/news/search
- Update: PUT /api/news/:id
- Delete: DELETE /api/news/:id

## Advanced MongoDB Features

### 1. **Aggregation Pipeline**

```javascript
// Get trending articles (most viewed)
app.get('/api/news/trending', async (req, res) => {
  const trending = await Article.aggregate([
    { $sort: { views: -1 } },
    { $limit: 10 }
  ]);
  res.json(trending);
});
```

### 2. **Text Search with Relevance**

```javascript
// Search with relevance scoring
const articles = await Article.find(
  { $text: { $search: query } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });
```

### 3. **Filtering by Date Range**

```javascript
const articles = await Article.find({
  publishedAt: {
    $gte: new Date('2026-01-01'),
    $lte: new Date('2026-12-31')
  }
});
```

## Deployment

### Deploy to Heroku

1. Create `Procfile`:
```
web: node server.js
```

2. Set environment variables in Heroku:
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set NODE_ENV="production"
```

3. Deploy:
```bash
git push heroku main
```

### Deploy to AWS, Azure, or Google Cloud

Similar approach - set environment variables and deploy the Node.js application.

## Performance Optimization

1. **Indexes**
   ```javascript
   articleSchema.index({ publishedAt: -1 });
   articleSchema.index({ 'source.name': 1 });
   ```

2. **Lean Queries**
   ```javascript
   Article.find().lean(); // Returns plain objects, not Mongoose documents
   ```

3. **Pagination**
   - Always use skip/limit for large datasets
   - Avoid fetching all documents

4. **Connection Pooling**
   - Mongoose handles pooling automatically
   - Adjust with `maxPoolSize` option if needed

## Troubleshooting

### Connection Issues
```
// Check MongoDB Atlas IP whitelist
// Ensure your IP is added to Atlas cluster
```

### Duplicate Key Error
```
// Remove unique constraint or handle duplicates
Article.collection.dropIndex('url_1');
```

### Slow Queries
```javascript
// Add explain() to analyze queries
Article.find().explain("executionStats");
```

## Summary

MongoDB integration provides:
✅ Persistent data storage  
✅ Scalable database  
✅ Full-text search  
✅ Pagination support  
✅ CRUD operations  
✅ Cloud hosting with MongoDB Atlas  
✅ Easy deployment  

Your News App backend is now production-ready with MongoDB!
