// lib/config.dart

import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configuration service for managing environment variables
/// Load environment variables from .env file using flutter_dotenv
class AppConfig {
  // Private constructor to prevent instantiation
  AppConfig._();

  /// Initialize configuration by loading .env file
  static Future<void> initialize() async {
    await dotenv.load();
  }

  // ===== API Configuration =====
  
  /// Backend API base URL
  /// Default: http://localhost:3000/api
  static String get backendUrl {
    return dotenv.env['BACKEND_URL'] ?? 'http://localhost:3000/api';
  }

  /// API timeout in seconds
  /// Default: 10
  static int get apiTimeout {
    final timeout = dotenv.env['API_TIMEOUT'] ?? '10';
    return int.tryParse(timeout) ?? 10;
  }

  /// Cache duration in hours
  /// Default: 24
  static int get cacheDurationHours {
    final duration = dotenv.env['CACHE_DURATION_HOURS'] ?? '24';
    return int.tryParse(duration) ?? 24;
  }

  // ===== Feature Flags =====

  /// Enable offline mode (use cached data when offline)
  /// Default: true
  static bool get enableOfflineMode {
    final enabled = dotenv.env['ENABLE_OFFLINE_MODE'] ?? 'true';
    return enabled.toLowerCase() == 'true';
  }

  /// Enable article caching to local storage
  /// Default: true
  static bool get enableArticleCaching {
    final enabled = dotenv.env['ENABLE_ARTICLE_CACHING'] ?? 'true';
    return enabled.toLowerCase() == 'true';
  }

  /// Enable image caching
  /// Default: true
  static bool get enableImageCaching {
    final enabled = dotenv.env['ENABLE_IMAGE_CACHING'] ?? 'true';
    return enabled.toLowerCase() == 'true';
  }

  /// Enable detailed logging for debugging
  /// Default: false
  static bool get enableDetailedLogs {
    final enabled = dotenv.env['ENABLE_DETAILED_LOGS'] ?? 'false';
    return enabled.toLowerCase() == 'true';
  }

  // ===== UI Configuration =====

  /// Number of articles per page for pagination
  /// Default: 20
  static int get articlesPerPage {
    final perPage = dotenv.env['ARTICLES_PER_PAGE'] ?? '20';
    return int.tryParse(perPage) ?? 20;
  }

  /// Maximum length for article description
  /// Default: 200 characters
  static int get maxDescriptionLength {
    final length = dotenv.env['MAX_DESCRIPTION_LENGTH'] ?? '200';
    return int.tryParse(length) ?? 200;
  }

  /// Show author information in UI
  /// Default: true
  static bool get showAuthorInfo {
    final show = dotenv.env['SHOW_AUTHOR_INFO'] ?? 'true';
    return show.toLowerCase() == 'true';
  }

  /// Show source information in UI
  /// Default: true
  static bool get showSourceInfo {
    final show = dotenv.env['SHOW_SOURCE_INFO'] ?? 'true';
    return show.toLowerCase() == 'true';
  }

  // ===== Helper Methods =====

  /// Get a configuration value by key with a default value
  static String getConfigValue(String key, String defaultValue) {
    return dotenv.env[key] ?? defaultValue;
  }

  /// Log all configuration values (for debugging)
  static void printConfiguration() {
    print('=== App Configuration ===');
    print('Backend URL: $backendUrl');
    print('API Timeout: ${apiTimeout}s');
    print('Cache Duration: ${cacheDurationHours}h');
    print('Offline Mode: $enableOfflineMode');
    print('Article Caching: $enableArticleCaching');
    print('Image Caching: $enableImageCaching');
    print('Detailed Logs: $enableDetailedLogs');
    print('Articles Per Page: $articlesPerPage');
    print('Max Description Length: $maxDescriptionLength');
    print('Show Author Info: $showAuthorInfo');
    print('Show Source Info: $showSourceInfo');
    print('========================');
  }
}
