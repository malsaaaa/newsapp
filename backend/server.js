// backend/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news_app';
mongoose.connect(mongoURI).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB error:', err));
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

// Sample news data (for seeding database)
const sampleNews = [
  {
    source: { id: "techcrunch", name: "TechCrunch" },
    author: "Sarah Chen",
    title: "AI Breakthrough: New Model Achieves Human-Level Performance",
    description: "Researchers announce a groundbreaking AI model that matches human performance in multiple domains, marking a significant milestone in artificial intelligence.",
    url: "https://techcrunch.com/ai-breakthrough",
    urlToImage: "https://picsum.photos/600/400?random=1",
    publishedAt: "2026-05-05T10:30:00Z",
    content: "A major breakthrough in artificial intelligence research has been announced today. Scientists have developed a new model..."
  },
  {
    source: { id: "bbc-news", name: "BBC News" },
    author: "James Wilson",
    title: "Global Climate Summit Reaches Historic Agreement",
    description: "World leaders agree on bold new climate action plan during the International Climate Conference, pledging significant emissions reductions.",
    url: "https://bbc.com/news/climate",
    urlToImage: "https://picsum.photos/600/400?random=2",
    publishedAt: "2026-05-04T14:15:00Z",
    content: "In a historic moment for global climate action, world leaders have reached an agreement on unprecedented climate measures..."
  },
  {
    source: { id: "cnn", name: "CNN" },
    author: "Maria Garcia",
    title: "New Medical Treatment Shows Promise in Cancer Research",
    description: "Clinical trials reveal a new immunotherapy treatment that significantly improves survival rates in advanced cancer patients.",
    url: "https://cnn.com/health/cancer-treatment",
    urlToImage: "https://picsum.photos/600/400?random=3",
    publishedAt: "2026-05-04T08:45:00Z",
    content: "Researchers have published promising results from clinical trials of a new cancer treatment. The immunotherapy approach..."
  },
  {
    source: { id: "the-guardian", name: "The Guardian" },
    author: "Robert Johnson",
    title: "Tech Company Launches Revolutionary Mobile Device",
    description: "A leading technology company unveils its latest smartphone with groundbreaking features and innovative design.",
    url: "https://theguardian.com/tech/mobile",
    urlToImage: "https://picsum.photos/600/400?random=4",
    publishedAt: "2026-05-03T16:20:00Z",
    content: "The technology world has been buzzing with anticipation, and today the wait is over. A major tech company has unveiled..."
  },
  {
    source: { id: "espn", name: "ESPN" },
    author: "Mike Anderson",
    title: "Championship Match Delivers Thrilling Victory",
    description: "In an exciting match, the home team defeats rivals in a nail-biting championship game, securing their position in the finals.",
    url: "https://espn.com/sports/championship",
    urlToImage: "https://picsum.photos/600/400?random=5",
    publishedAt: "2026-05-03T22:30:00Z",
    content: "What a game! The championship match delivered everything fans could have hoped for. In a thrilling display of skill..."
  },
  {
    source: { id: "reuters", name: "Reuters" },
    author: "David Smith",
    title: "Markets Rally on Strong Economic Data",
    description: "Global stock markets surge following the release of positive economic indicators and corporate earnings reports.",
    url: "https://reuters.com/business/markets",
    urlToImage: "https://picsum.photos/600/400?random=6",
    publishedAt: "2026-05-02T13:00:00Z",
    content: "Financial markets around the world have responded positively to economic news. The strong economic indicators suggest..."
  },
  {
    source: { id: "nasa", name: "NASA" },
    author: "Dr. Elena Rodriguez",
    title: "Space Telescope Captures Stunning Images of Distant Galaxy",
    description: "The latest images from the James Webb Space Telescope reveal unprecedented details about a galaxy billions of light-years away.",
    url: "https://nasa.gov/jwst",
    urlToImage: "https://picsum.photos/600/400?random=7",
    publishedAt: "2026-05-01T09:15:00Z",
    content: "Scientists are marveling at spectacular new images captured by the James Webb Space Telescope. These images provide..."
  },
  {
    source: { id: "nature", name: "Nature" },
    author: "Prof. Lisa Wong",
    title: "Scientists Discover New Species in Amazon Rainforest",
    description: "Researchers uncover a previously unknown species of bird in the depths of the Amazon rainforest, expanding our understanding of biodiversity.",
    url: "https://nature.com/biodiversity",
    urlToImage: "https://picsum.photos/600/400?random=8",
    publishedAt: "2026-04-30T11:45:00Z",
    content: "In a remarkable discovery, scientists exploring the Amazon rainforest have identified a species previously unknown to science..."
  }
];

// Initialize sample data if enabled
async function initializeSampleData() {
  if (process.env.ENABLE_SAMPLE_DATA !== 'true') {
    return;
  }

  try {
    const count = await Article.countDocuments();
    if (count === 0) {
      console.log('📝 Seeding database with sample news data...');
      await Article.insertMany(sampleNews);
      console.log(`✅ Inserted ${sampleNews.length} sample articles`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

// ===== API ENDPOINTS =====

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// GET /api/news/top-headlines
// Fetch top headlines with pagination from MongoDB
app.get('/api/news/top-headlines', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);

    if (page < 1) {
      return res.status(400).json({ status: 'error', message: 'Page number must be greater than 0' });
    }

    const skip = (page - 1) * pageSize;

    // Get total count
    const totalResults = await Article.countDocuments();

    // Fetch articles
    const articles = await Article.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(200).json({
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
// Search for articles by query in MongoDB
app.get('/api/news/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);

    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Search query is required' });
    }

    const skip = (page - 1) * pageSize;

    // Search using regex for case-insensitive search
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

    res.status(200).json({
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
// Fetch news by category from MongoDB
app.get('/api/news/category/:category', async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);

    const skip = (page - 1) * pageSize;

    // Filter by source id (category)
    const totalResults = await Article.countDocuments({ 'source.id': category });
    const articles = await Article.find({ 'source.id': category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(200).json({
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

// GET /api/news/article/:id
// Fetch a specific article by MongoDB ID
app.get('/api/news/article/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }
    res.status(200).json({ status: 'ok', article: article });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/news/all
// Fetch all articles without pagination
app.get('/api/news/all', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }).lean();
    res.status(200).json({
      status: 'ok',
      totalResults: articles.length,
      articles: articles
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/news/add
// Add a new article to MongoDB
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

// PUT /api/news/:id
// Update an article in MongoDB
app.put('/api/news/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }
    res.status(200).json({ status: 'ok', article: article });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/news/:id
// Delete an article from MongoDB
app.delete('/api/news/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }
    res.status(200).json({ status: 'ok', message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'News App Backend API',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      health: 'GET /api/health',
      topHeadlines: 'GET /api/news/top-headlines?page=1&pageSize=20',
      search: 'GET /api/news/search?q=query&page=1&pageSize=20',
      category: 'GET /api/news/category/:category?page=1&pageSize=20',
      article: 'GET /api/news/article/:id',
      all: 'GET /api/news/all',
      add: 'POST /api/news/add',
      update: 'PUT /api/news/:id',
      delete: 'DELETE /api/news/:id'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 News App Backend Server is running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${mongoURI}`);
  
  // Initialize sample data if configured
  await initializeSampleData();
  
  console.log(`\nAvailable endpoints:`);
  console.log(`  - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  - Top Headlines: http://localhost:${PORT}/api/news/top-headlines`);
  console.log(`  - Search: http://localhost:${PORT}/api/news/search?q=technology`);
  console.log(`  - Category: http://localhost:${PORT}/api/news/category/techcrunch`);
  console.log(`  - All Articles: http://localhost:${PORT}/api/news/all`);
  console.log(`  - Add Article: POST http://localhost:${PORT}/api/news/add`);
  console.log(`  - Update Article: PUT http://localhost:${PORT}/api/news/:id`);
  console.log(`  - Delete Article: DELETE http://localhost:${PORT}/api/news/:id`);
  console.log(`\nPress Ctrl+C to stop the server`);
});
