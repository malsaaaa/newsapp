// lib/news_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'article.dart';
import 'cache_manager.dart';
import 'config.dart';

class NewsApiService {
  // Use configuration from AppConfig
  late final String baseUrl;
  late final int apiTimeout;
  
  final CacheManager cacheManager = CacheManager();

  NewsApiService() {
    // Initialize from configuration
    baseUrl = AppConfig.backendUrl;
    apiTimeout = AppConfig.apiTimeout;
  }

  /// Validates if the API is properly configured
  bool get isConfigured => baseUrl.isNotEmpty;

  /// Fetches top headlines with optional filters and pagination
  /// [country] - Country code (e.g., 'us' for USA - Not used with backend)
  /// [category] - News category (e.g., 'business', 'sports', 'health')
  /// [page] - Page number for pagination (starts at 1)
  /// [pageSize] - Number of articles per page (default 20, max 100)
  /// [useCache] - Whether to use cached data if available
  Future<List<Article>> fetchTopHeadlines({
    String country = 'us',
    String? category,
    int page = 1,
    int pageSize = 20,
    bool useCache = true,
  }) async {
    if (page < 1) {
      throw Exception('Page number must be greater than 0');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw Exception('Page size must be between 1 and 100');
    }

    // Try to use cache for first page
    if (page == 1 && useCache) {
      await cacheManager.init();
      final cachedArticles = await cacheManager.getHeadlines();
      if (cachedArticles != null) {
        return cachedArticles;
      }
    }

    // Build URL with pagination parameters
    String url = '$baseUrl/news/top-headlines?page=$page&pageSize=$pageSize';
    
    // Add category if provided
    if (category != null && category.isNotEmpty) {
      url = '$baseUrl/news/category/$category?page=$page&pageSize=$pageSize';
    }

    try {
      final response = await http.get(Uri.parse(url)).timeout(
        Duration(seconds: apiTimeout),
        onTimeout: () => throw Exception('Request timeout. Please check your internet connection.'),
      );

      if (response.statusCode == 200) {
        // Explicitly decode response as UTF-8
        final String decodedBody = utf8.decode(response.bodyBytes);
        final Map<String, dynamic> jsonData = json.decode(decodedBody);
        
        if (jsonData['articles'] == null) {
          throw Exception('Invalid response format: ${jsonData.keys.join(", ")}');
        }

        final List<dynamic> articlesJson = jsonData['articles'] as List<dynamic>;

        if (articlesJson.isEmpty) {
          return [];
        }

        final articles = articlesJson
            .map((jsonItem) => Article.fromJson(jsonItem as Map<String, dynamic>))
            .toList();

        // Cache the first page
        if (page == 1) {
          await cacheManager.init();
          await cacheManager.saveHeadlines(articles);
        }

        return articles;
      } else if (response.statusCode == 400) {
        throw Exception('Bad request: ${response.body}');
      } else if (response.statusCode == 404) {
        throw Exception('Endpoint not found. Is the backend server running?');
      } else {
        throw Exception('Failed to load news (Status: ${response.statusCode})');
      }
    } catch (e) {
      // Try to use cache as fallback
      if (page == 1) {
        await cacheManager.init();
        final cachedArticles = await cacheManager.getHeadlines();
        if (cachedArticles != null) {
          return cachedArticles;
        }
      }
      rethrow;
    }
  }

  /// Searches for news articles by query with pagination
  /// [query] - Search query string
  /// [sortBy] - Sort results by 'relevancy', 'popularity', or 'publishedAt' (not used with backend)
  /// [page] - Page number for pagination (starts at 1)
  /// [pageSize] - Number of articles per page (default 20, max 100)
  /// [useCache] - Whether to use cached data if available
  Future<List<Article>> searchNews({
    required String query,
    String sortBy = 'publishedAt',
    int page = 1,
    int pageSize = 20,
    bool useCache = true,
  }) async {
    if (query.isEmpty) {
      throw Exception('Search query cannot be empty');
    }

    if (page < 1) {
      throw Exception('Page number must be greater than 0');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw Exception('Page size must be between 1 and 100');
    }

    // Try to use cache for first page
    if (page == 1 && useCache) {
      await cacheManager.init();
      final cachedArticles = await cacheManager.getSearchResults(query);
      if (cachedArticles != null) {
        return cachedArticles;
      }
    }

    // Build URL with URL encoding for the query parameter
    final String url = '$baseUrl/news/search?q=${Uri.encodeComponent(query)}&page=$page&pageSize=$pageSize';

    try {
      final response = await http.get(Uri.parse(url)).timeout(
        Duration(seconds: apiTimeout),
        onTimeout: () => throw Exception('Request timeout. Please check your internet connection.'),
      );

      if (response.statusCode == 200) {
        // Explicitly decode response as UTF-8
        final String decodedBody = utf8.decode(response.bodyBytes);
        final Map<String, dynamic> jsonData = json.decode(decodedBody);
        
        if (jsonData['articles'] == null) {
          throw Exception('Invalid response format');
        }

        final List<dynamic> articlesJson = jsonData['articles'] as List<dynamic>;

        if (articlesJson.isEmpty) {
          return [];
        }

        final articles = articlesJson
            .map((jsonItem) => Article.fromJson(jsonItem as Map<String, dynamic>))
            .toList();

        // Cache the first page
        if (page == 1) {
          await cacheManager.init();
          await cacheManager.saveSearchResults(query, articles);
        }

        return articles;
      } else if (response.statusCode == 400) {
        throw Exception('Bad request: ${response.body}');
      } else if (response.statusCode == 404) {
        throw Exception('Endpoint not found. Is the backend server running?');
      } else {
        throw Exception('Failed to search news (Status: ${response.statusCode})');
      }
    } catch (e) {
      // Try to use cache as fallback
      if (page == 1) {
        await cacheManager.init();
        final cachedArticles = await cacheManager.getSearchResults(query);
        if (cachedArticles != null) {
          return cachedArticles;
        }
      }
      rethrow;
    }
  }
}
