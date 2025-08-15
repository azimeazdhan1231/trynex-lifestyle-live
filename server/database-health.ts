import { db, pool, checkDatabaseHealth } from './db';
import { products, categories, offers, orders, users, userOrders, admins, siteSettings, promoCodes, analytics, sessions, userCarts, customOrders } from "@shared/schema";
import { eq } from 'drizzle-orm';

export interface DatabaseHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    connection: boolean;
    tables: boolean;
    basicQueries: boolean;
    performance: boolean;
  };
  details: {
    connectionTime?: number;
    tableCount?: number;
    errorCount?: number;
    warnings?: string[];
  };
}

export async function performDatabaseHealthCheck(): Promise<DatabaseHealthStatus> {
  const startTime = Date.now();
  const warnings: string[] = [];
  let errorCount = 0;
  
  try {
    // Check 1: Basic connection
    const connectionStart = Date.now();
    const connectionHealthy = await checkDatabaseHealth();
    const connectionTime = Date.now() - connectionStart;
    
    if (!connectionHealthy) {
      errorCount++;
      warnings.push('Database connection failed');
    }

    // Check 2: Table existence and basic structure
    let tablesHealthy = false;
    let tableCount = 0;
    
    try {
      // Try to count records from each table to verify they exist
      const productCount = await db.select().from(products).limit(1);
      const categoryCount = await db.select().from(categories).limit(1);
      const orderCount = await db.select().from(orders).limit(1);
      
      tableCount = 3; // We checked 3 main tables
      tablesHealthy = true;
    } catch (error) {
      errorCount++;
      warnings.push(`Table structure check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check 3: Basic queries
    let basicQueriesHealthy = false;
    
    try {
      // Try a simple select query
      const result = await db.execute('SELECT 1 as test');
      basicQueriesHealthy = true;
    } catch (error) {
      errorCount++;
      warnings.push(`Basic query test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check 4: Performance check
    let performanceHealthy = false;
    
    try {
      const perfStart = Date.now();
      await db.select().from(products).limit(10);
      const perfTime = Date.now() - perfStart;
      
      // Consider performance healthy if query takes less than 1000ms
      performanceHealthy = perfTime < 1000;
      
      if (perfTime > 500) {
        warnings.push(`Performance warning: Product query took ${perfTime}ms`);
      }
    } catch (error) {
      errorCount++;
      warnings.push(`Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (errorCount === 0) {
      status = 'healthy';
    } else if (errorCount <= 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const totalTime = Date.now() - startTime;

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        connection: connectionHealthy,
        tables: tablesHealthy,
        basicQueries: basicQueriesHealthy,
        performance: performanceHealthy,
      },
      details: {
        connectionTime,
        tableCount,
        errorCount,
        warnings,
      },
    };

  } catch (error) {
    errorCount++;
    warnings.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        connection: false,
        tables: false,
        basicQueries: false,
        performance: false,
      },
      details: {
        errorCount,
        warnings,
      },
    };
  }
}

export async function setupDatabaseTables() {
  try {
    console.log('🔧 Setting up database tables...');
    
    // Check if tables exist by trying to query them
    const tables = [products, categories, offers, orders, users, userOrders, admins, siteSettings, promoCodes, analytics, sessions, userCarts, customOrders];
    
    for (const table of tables) {
      try {
        await db.select().from(table).limit(1);
        console.log(`✅ Table ${table._.name} exists`);
      } catch (error) {
        console.warn(`⚠️ Table ${table._.name} may not exist:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('✅ Database setup check completed');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

export async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');
    
    // Check if we already have data
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length > 0) {
      console.log('✅ Sample data already exists, skipping seed');
      return true;
    }
    
    // Insert sample categories
    const sampleCategories = [
      { name: 'Gifts', name_bengali: 'উপহার', description: 'Special gifts for your loved ones' },
      { name: 'Electronics', name_bengali: 'ইলেকট্রনিক্স', description: 'Latest electronic gadgets' },
      { name: 'Fashion', name_bengali: 'ফ্যাশন', description: 'Trendy fashion items' },
      { name: 'Home & Living', name_bengali: 'ঘর ও জীবন', description: 'Home decoration and living essentials' },
    ];
    
    for (const category of sampleCategories) {
      try {
        await db.insert(categories).values(category);
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to add category ${category.name}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Insert sample products
    const sampleProducts = [
      {
        name: 'Custom Photo Frame',
        name_bengali: 'কাস্টম ফটো ফ্রেম',
        price: '299',
        description: 'Beautiful custom photo frame for your memories',
        category: 'Gifts',
        stock: 50,
        is_featured: true,
        is_latest: true,
      },
      {
        name: 'Smart Watch',
        name_bengali: 'স্মার্ট ওয়াচ',
        price: '2999',
        description: 'Feature-rich smartwatch with health monitoring',
        category: 'Electronics',
        stock: 25,
        is_featured: true,
        is_best_selling: true,
      },
      {
        name: 'Designer T-Shirt',
        name_bengali: 'ডিজাইনার টি-শার্ট',
        price: '599',
        description: 'Comfortable and stylish designer t-shirt',
        category: 'Fashion',
        stock: 100,
        is_latest: true,
      },
    ];
    
    for (const product of sampleProducts) {
      try {
        await db.insert(products).values(product);
        console.log(`✅ Added product: ${product.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to add product ${product.name}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('✅ Sample data seeding completed');
    return true;
    
  } catch (error) {
    console.error('❌ Sample data seeding failed:', error);
    return false;
  }
}

export async function getDatabaseStats() {
  try {
    const stats = {
      products: 0,
      categories: 0,
      orders: 0,
      users: 0,
      totalTables: 0,
    };
    
    try {
      const productCount = await db.select().from(products);
      stats.products = productCount.length;
    } catch (error) {
      console.warn('Could not count products:', error);
    }
    
    try {
      const categoryCount = await db.select().from(categories);
      stats.categories = categoryCount.length;
    } catch (error) {
      console.warn('Could not count categories:', error);
    }
    
    try {
      const orderCount = await db.select().from(orders);
      stats.orders = orderCount.length;
    } catch (error) {
      console.warn('Could not count orders:', error);
    }
    
    try {
      const userCount = await db.select().from(users);
      stats.users = userCount.length;
    } catch (error) {
      console.warn('Could not count users:', error);
    }
    
    stats.totalTables = 4; // products, categories, orders, users
    
    return stats;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}

// Auto-run health check on import
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 Running database health check...');
  
  performDatabaseHealthCheck()
    .then((status) => {
      console.log('📊 Database Health Status:', JSON.stringify(status, null, 2));
      
      if (status.status === 'healthy') {
        console.log('✅ Database is healthy!');
        process.exit(0);
      } else if (status.status === 'degraded') {
        console.log('⚠️ Database is degraded, some issues detected');
        process.exit(1);
      } else {
        console.log('❌ Database is unhealthy, critical issues detected');
        process.exit(2);
      }
    })
    .catch((error) => {
      console.error('💥 Health check failed:', error);
      process.exit(3);
    });
} 