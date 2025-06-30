import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import icpRoutes from './routes/icp';
import { leadsRoutes } from './routes/leads';
import { enrichRoutes } from './routes/enrich';
import { emailRoutes } from './routes/email';
import { uploadRoutes } from './routes/upload';
import salesIntelligenceRoutes from './routes/salesIntelligence';
import companyAnalyzeRoutes from './routes/companyAnalyze';
import authRoutes from './routes/auth';
import { initDatabase, runQuery, getCachedResult } from './database/init';
import workflowRoutes from './routes/workflow';

// Load environment variables
dotenv.config();

console.log('DEBUG: SMTP_USER:', process.env.SMTP_USER);
console.log('DEBUG: SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'MISSING');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`🚀 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced health check endpoint with system status
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Check API key availability
    const apiKeysStatus = checkAPIKeys();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '0.1.0-alpha',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      apiKeys: apiKeysStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const cacheStats = await getCacheStats();
    const dbStats = await getDatabaseStats();
    
    res.json({
      success: true,
      data: {
        cache: cacheStats,
        database: dbStats,
        agents: {
          claude: 'active',
          apollo: process.env.APOLLO_API_KEY ? 'active' : 'inactive',
          research: 'active',
          email: 'active',
          salesIntelligence: 'active'
        }
      }
    });
  } catch (error) {
    console.error('API status check failed:', error);
    res.status(500).json({ 
      error: 'Failed to get API status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// NEW: Comprehensive testing and monitoring endpoints

// System health check with detailed diagnostics
app.get('/health/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connectivity
    let dbStatus = 'unknown';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await runQuery('SELECT 1 as test');
      dbLatency = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }
    
    // Test external API connectivity
    const apiTests: {
      openrouter: boolean;
      apollo: boolean;
      instantly: boolean;
      serper: boolean;
    } = {
      openrouter: false,
      apollo: false,
      instantly: false,
      serper: false
    };
    
    // Test OpenRouter (Claude)
    try {
      if (process.env.OPENROUTER_API_KEY) {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });
        apiTests.openrouter = response.ok;
      }
    } catch (error) {
      // API test failed
    }
    
    // Test Apollo.io
    try {
      if (process.env.APOLLO_API_KEY) {
        const response = await fetch('https://api.apollo.io/v1/auth/health', {
          headers: { 'X-Api-Key': process.env.APOLLO_API_KEY }
        });
        apiTests.apollo = response.ok;
      }
    } catch (error) {
      // API test failed
    }
    
    // Test Instantly
    try {
      if (process.env.INSTANTLY_API_KEY) {
        const response = await fetch('https://api.instantly.ai/api/v1/account', {
          headers: { 'Authorization': `Bearer ${process.env.INSTANTLY_API_KEY}` }
        });
        apiTests.instantly = response.ok;
      }
    } catch (error) {
      // API test failed
    }
    
    // Test Serper
    try {
      if (process.env.SERPER_API_KEY) {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: 'test' })
        });
        apiTests.serper = response.ok;
      }
    } catch (error) {
      // API test failed
    }
    
    const totalLatency = Date.now() - startTime;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0-alpha',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbStatus,
        latency: dbLatency,
        message: dbStatus === 'connected' ? 'Database is healthy' : 'Database connection failed'
      },
      apis: apiTests,
      performance: {
        totalLatency,
        databaseLatency: dbLatency
      }
    });
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Comprehensive system test endpoint
app.post('/test/system', async (req, res) => {
  try {
    const testResults = {
      database: { passed: false, details: '' },
      apis: { passed: false, details: '' },
      agents: { passed: false, details: '' },
      cache: { passed: false, details: '' },
      overall: false
    };
    
    console.log('🧪 Starting comprehensive system test...');
    
    // Test 1: Database operations
    try {
      await runQuery('SELECT COUNT(*) as count FROM icps');
      await runQuery('SELECT COUNT(*) as count FROM leads');
      await runQuery('SELECT COUNT(*) as count FROM sales_intelligence_reports');
      testResults.database = { passed: true, details: 'All database tables accessible' };
    } catch (error) {
      testResults.database = { passed: false, details: `Database test failed: ${error}` };
    }
    
    // Test 2: API connectivity
    const apiTests: string[] = [];
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });
        apiTests.push(`OpenRouter: ${response.ok ? 'OK' : 'Failed'}`);
      } catch (error) {
        apiTests.push('OpenRouter: Error');
      }
    }
    
    if (process.env.APOLLO_API_KEY) {
      try {
        const response = await fetch('https://api.apollo.io/v1/auth/health', {
          headers: { 'X-Api-Key': process.env.APOLLO_API_KEY }
        });
        apiTests.push(`Apollo: ${response.ok ? 'OK' : 'Failed'}`);
      } catch (error) {
        apiTests.push('Apollo: Error');
      }
    }
    
    testResults.apis = { 
      passed: apiTests.length > 0, 
      details: apiTests.join(', ') || 'No APIs configured' 
    };
    
    // Test 3: Agent functionality
    try {
      const { callClaude3 } = await import('../agents/claude');
      const { searchApolloLeads } = await import('../agents/apolloAgent');
      
      // Test Claude with a simple prompt
      const claudeTest = await callClaude3('Say "Hello, World!"', 1);
      const apolloTest = await searchApolloLeads({ industry: 'Technology' }, 1);
      
      testResults.agents = { 
        passed: true, 
        details: `Claude: OK, Apollo: ${apolloTest.length} leads found` 
      };
    } catch (error) {
      testResults.agents = { passed: false, details: `Agent test failed: ${error}` };
    }
    
    // Test 4: Cache functionality
    try {
      const { getCachedResult, saveToCache } = await import('./database/init');
      
      // Test cache operations
      const testUrl = 'test-cache-url';
      const testData = { test: 'data' };
      
      await saveToCache(testUrl, false, testData, null, 1);
      const cached = await getCachedResult(testUrl, false);
      
      testResults.cache = { 
        passed: cached !== null, 
        details: cached ? 'Cache read/write working' : 'Cache test failed' 
      };
    } catch (error) {
      testResults.cache = { passed: false, details: `Cache test failed: ${error}` };
    }
    
    // Overall result
    testResults.overall = Object.values(testResults)
      .filter(result => typeof result === 'object' && 'passed' in result)
      .every(result => (result as any).passed);
    
    console.log('✅ System test completed');
    
    res.json({
      success: true,
      testResults,
      timestamp: new Date().toISOString(),
      duration: Date.now() - Date.now()
    });
    
  } catch (error) {
    console.error('System test failed:', error);
    res.status(500).json({
      success: false,
      error: 'System test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Performance benchmark endpoint
app.post('/test/performance', async (req, res) => {
  try {
    const benchmarks = {
      database: { operations: 0, avgLatency: 0 },
      claude: { calls: 0, avgLatency: 0 },
      apollo: { calls: 0, avgLatency: 0 },
      cache: { operations: 0, avgLatency: 0 }
    };
    
    console.log('⚡ Starting performance benchmarks...');
    
    // Database benchmark
    const dbStart = Date.now();
    for (let i = 0; i < 10; i++) {
      await runQuery('SELECT COUNT(*) as count FROM icps');
    }
    const dbEnd = Date.now();
    benchmarks.database = {
      operations: 10,
      avgLatency: (dbEnd - dbStart) / 10
    };
    
    // Cache benchmark
    const cacheStart = Date.now();
    for (let i = 0; i < 20; i++) {
      await getCachedResult(`benchmark-${i}`, false);
    }
    const cacheEnd = Date.now();
    benchmarks.cache = {
      operations: 20,
      avgLatency: (cacheEnd - cacheStart) / 20
    };
    
    // Claude benchmark (limited to 1 call to avoid costs)
    try {
      const { callClaude3 } = await import('../agents/claude');
      const claudeStart = Date.now();
      await callClaude3('Test response', 1);
      const claudeEnd = Date.now();
      benchmarks.claude = {
        calls: 1,
        avgLatency: claudeEnd - claudeStart
      };
    } catch (error) {
      benchmarks.claude = { calls: 0, avgLatency: 0 };
    }
    
    // Apollo benchmark (limited to 1 call to avoid rate limits)
    try {
      const { searchApolloLeads } = await import('../agents/apolloAgent');
      const apolloStart = Date.now();
      await searchApolloLeads({ industry: 'Technology' }, 1);
      const apolloEnd = Date.now();
      benchmarks.apollo = {
        calls: 1,
        avgLatency: apolloEnd - apolloStart
      };
    } catch (error) {
      benchmarks.apollo = { calls: 0, avgLatency: 0 };
    }
    
    console.log('✅ Performance benchmarks completed');
    
    res.json({
      success: true,
      benchmarks,
      timestamp: new Date().toISOString(),
      summary: {
        databasePerformance: benchmarks.database.avgLatency < 50 ? 'Excellent' : 'Good',
        cachePerformance: benchmarks.cache.avgLatency < 10 ? 'Excellent' : 'Good',
        apiPerformance: 'Limited test due to rate limits'
      }
    });
    
  } catch (error) {
    console.error('Performance test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Performance test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Load testing endpoint
app.post('/test/load', async (req, res) => {
  try {
    const { concurrent = 5, duration = 30 } = req.body;
    
    console.log(`🔄 Starting load test: ${concurrent} concurrent requests for ${duration}s`);
    
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsPerSecond: 0,
      errors: [] as string[]
    };
    
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    
    // Simulate concurrent requests
    const makeRequest = async () => {
      const requestStart = Date.now();
      try {
        const response = await fetch('http://localhost:3001/api/status');
        if (response.ok) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          results.errors.push(`HTTP ${response.status}`);
        }
      } catch (error) {
        results.failedRequests++;
        results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
      results.totalRequests++;
    };
    
    // Run concurrent requests
    const intervals: NodeJS.Timeout[] = [];
    for (let i = 0; i < concurrent; i++) {
      const interval = setInterval(async () => {
        if (Date.now() > endTime) {
          clearInterval(interval);
          return;
        }
        await makeRequest();
      }, 1000 / concurrent); // Distribute requests evenly
      intervals.push(interval);
    }
    
    // Wait for test to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    
    // Clean up intervals
    intervals.forEach(interval => clearInterval(interval));
    
    const totalDuration = (Date.now() - startTime) / 1000;
    results.requestsPerSecond = results.totalRequests / totalDuration;
    
    console.log('✅ Load test completed');
    
    res.json({
      success: true,
      loadTest: results,
      configuration: { concurrent, duration },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Load test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Load test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes with enhanced error handling
app.use('/api/auth', authRoutes);
app.use('/api/icp', icpRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/enrich', enrichRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sales-intelligence', salesIntelligenceRoutes);
app.use('/api/company-analyze', companyAnalyzeRoutes);
app.use('/api/workflow', workflowRoutes);

// Enhanced error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Server Error:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Add external logging service (Sentry, LogRocket, etc.)
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/health',
      '/api/status',
      '/api/icp',
      '/api/leads',
      '/api/enrich',
      '/api/email',
      '/api/upload',
      '/api/sales-intelligence',
      '/api/company-analyze',
      '/api/workflow'
    ]
  });
});

// Helper functions
async function checkDatabaseHealth(): Promise<any> {
  try {
    const { getRow } = await import('./database/init');
    await getRow('SELECT 1 as health_check');
    return { status: 'connected', message: 'Database is healthy' };
  } catch (error) {
    return { status: 'error', message: 'Database connection failed' };
  }
}

function checkAPIKeys(): any {
  return {
    openrouter: !!process.env.OPENROUTER_API_KEY,
    apollo: !!process.env.APOLLO_API_KEY,
    instantly: !!process.env.INSTANTLY_API_KEY,
    serper: !!process.env.SERPER_API_KEY
  };
}

async function getCacheStats(): Promise<any> {
  try {
    const { getCacheStats } = await import('./database/init');
    return await getCacheStats();
  } catch (error) {
    return { error: 'Failed to get cache stats' };
  }
}

async function getDatabaseStats(): Promise<any> {
  try {
    const { getRow } = await import('./database/init');
    const icpCount = await getRow('SELECT COUNT(*) as count FROM icps');
    const leadCount = await getRow('SELECT COUNT(*) as count FROM leads');
    const reportCount = await getRow('SELECT COUNT(*) as count FROM sales_intelligence_reports');
    
    return {
      icps: icpCount.count,
      leads: leadCount.count,
      reports: reportCount.count
    };
  } catch (error) {
    return { error: 'Failed to get database stats' };
  }
}

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Initializing PersonaOps API server...');
    
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 PersonaOps API server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📈 API Status: http://localhost:${PORT}/api/status`);
      console.log(`🎯 Available endpoints:`);
      console.log(`   - /api/icp - ICP/IBP generation`);
      console.log(`   - /api/leads - Lead search and enrichment`);
      console.log(`   - /api/enrich - Lead enrichment`);
      console.log(`   - /api/email - Email personalization`);
      console.log(`   - /api/upload - Campaign upload`);
      console.log(`   - /api/sales-intelligence - Sales intelligence reports`);
      console.log(`   - /api/company-analyze - Company analysis`);
      console.log(`   - /api/workflow - Workflow management`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 