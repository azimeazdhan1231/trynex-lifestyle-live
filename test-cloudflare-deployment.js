// Cloudflare Deployment Test Script
// Run this after deployment to verify all CRUD operations work

const BASE_URL = 'https://your-deployed-site.pages.dev'; // Replace with your actual URL

async function testAPI() {
  console.log('🚀 Testing Cloudflare Deployment CRUD Operations...\n');

  // Test data
  const testProduct = {
    name: 'Test Product',
    price: '99.99',
    category: 'electronics',
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
  };

  const testOrder = {
    customer_name: 'Test Customer',
    phone: '01700000000',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    address: 'Test Address',
    items: [{ id: '1', name: 'Test Product', quantity: 1, price: 99.99 }],
    total: 99.99
  };

  try {
    // 1. Test Products Endpoints
    console.log('📦 Testing Products...');
    
    // GET products
    const products = await fetch(`${BASE_URL}/api/products`);
    console.log(`✅ GET /api/products: ${products.status}`);
    const productsData = await products.json();
    console.log(`   Found ${productsData.length} products`);

    // POST product (requires admin auth)
    console.log('\n🔐 Testing Admin Login...');
    const login = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@trynex.com', password: 'admin123' })
    });
    console.log(`✅ POST /api/admin/login: ${login.status}`);
    
    if (login.ok) {
      const loginData = await login.json();
      const token = loginData.token;
      
      // Create product
      const createProduct = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testProduct)
      });
      console.log(`✅ POST /api/products: ${createProduct.status}`);
      
      if (createProduct.ok) {
        const newProduct = await createProduct.json();
        console.log(`   Created product with ID: ${newProduct.id}`);
        
        // Update product
        const updateProduct = await fetch(`${BASE_URL}/api/products/${newProduct.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ price: '149.99' })
        });
        console.log(`✅ PATCH /api/products/${newProduct.id}: ${updateProduct.status}`);
        
        // Delete product
        const deleteProduct = await fetch(`${BASE_URL}/api/products/${newProduct.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ DELETE /api/products/${newProduct.id}: ${deleteProduct.status}`);
      }
    }

    // 2. Test Orders Endpoints
    console.log('\n📋 Testing Orders...');
    
    // Create order
    const createOrder = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder)
    });
    console.log(`✅ POST /api/orders: ${createOrder.status}`);
    
    if (createOrder.ok) {
      const newOrder = await createOrder.json();
      console.log(`   Created order with tracking ID: ${newOrder.tracking_id}`);
      
      // Get order by tracking ID
      const getOrder = await fetch(`${BASE_URL}/api/orders/${newOrder.tracking_id}`);
      console.log(`✅ GET /api/orders/${newOrder.tracking_id}: ${getOrder.status}`);
    }

    // 3. Test Categories
    console.log('\n📂 Testing Categories...');
    const categories = await fetch(`${BASE_URL}/api/categories`);
    console.log(`✅ GET /api/categories: ${categories.status}`);
    const categoriesData = await categories.json();
    console.log(`   Found ${categoriesData.length} categories`);

    // 4. Test Settings
    console.log('\n⚙️ Testing Settings...');
    const settings = await fetch(`${BASE_URL}/api/settings`);
    console.log(`✅ GET /api/settings: ${settings.status}`);

    console.log('\n🎉 All tests completed! Check the results above.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAPI();