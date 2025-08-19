// Cloudflare Pages Functions - API Routes Handler
// Simplified and optimized for Cloudflare Workers runtime

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', ''); // Remove '/api' prefix

  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase configuration - using environment variables for sensitive keys
    const SUPABASE_URL = env.SUPABASE_URL || 'https://uftbaywtpnwdhflujhsb.supabase.co';
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE1NzQ2OCwiZXhwIjoyMDM5NzMzNDY4fQ.vFRhVnxY7hJOW7I1S5SIBZQhJV1O1kOhK8xk9tIhEZQ';

    // Common headers for Supabase requests
    const headers = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation' // To get the response body
    };

    // Route handling for Products
    if (path.startsWith('/products')) {
      if (request.method === 'GET') {
        // Handle product search
        if (path.includes('/search')) {
          const searchTerm = url.searchParams.get('q') || '';
          // Construct Supabase URL for searching products by name or description
          const supabaseUrl = `${SUPABASE_URL}/rest/v1/products?or=(name.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*)&select=*`;
          const response = await fetch(supabaseUrl, { headers });
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          // Get all products, ordered by creation date
          const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, { headers });
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Create a new product
      if (request.method === 'POST') {
        const body = await request.json();
        const productData = {
          // Generate a unique ID for the product
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: body.name,
          price: parseFloat(body.price),
          description: body.description || '',
          category: body.category || 'general',
          stock: parseInt(body.stock) || 0,
          image_url: body.image_url || '',
          images: JSON.stringify(body.images || []), // Store images as a JSON string
          is_featured: body.is_featured || false,
          is_latest: body.is_latest || false,
          is_best_selling: body.is_best_selling || false,
          created_at: new Date().toISOString()
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status // Pass through the status from Supabase
        });
      }

      // Update an existing product
      if (request.method === 'PATCH') {
        const productId = path.split('/')[2]; // Extract product ID from the path
        const body = await request.json();

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        });
      }

      // Delete a product
      if (request.method === 'DELETE') {
        const productId = path.split('/')[2]; // Extract product ID from the path

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
          method: 'DELETE',
          headers
        });

        // Return a success message if deletion is successful
        return new Response(JSON.stringify({ success: true, message: "Product deleted successfully" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    // Route handling for Orders
    if (path.startsWith('/orders')) {
      // Get all orders
      if (request.method === 'GET') {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, { headers });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create a new order
      if (request.method === 'POST') {
        const body = await request.json();
        const orderData = {
          // Generate unique IDs for order and tracking
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tracking_id: `TRK${Date.now()}`,
          customer_name: body.customer_name,
          phone: body.phone,
          district: body.district,
          thana: body.thana,
          address: body.address,
          items: JSON.stringify(body.items || []), // Store items as JSON string
          total: body.total.toString(),
          status: 'pending', // Default status
          created_at: new Date().toISOString()
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        });
      }
    }

    // Route for Admin to update order status
    if (path.startsWith('/admin/orders') && request.method === 'PATCH') {
      const orderId = path.split('/')[3]; // Extract order ID from path
      const body = await request.json();

      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: body.status }) // Update only the status
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });
    }

    // Route for Categories
    if (path.startsWith('/categories') && request.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, { headers });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route for Settings
    if (path.startsWith('/settings') && request.method === 'GET') {
      // Placeholder for settings, returning an empty object for now
      return new Response(JSON.stringify({}), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Admin login route
    if (path === '/admin/login' && request.method === 'POST') {
      const body = await request.json();
      // Basic authentication check
      if (body.email === 'admin@trynex.com' && body.password === 'admin123') {
        // Return a success token and user info
        return new Response(JSON.stringify({
          token: 'admin_authenticated',
          user: { email: body.email, role: 'admin' }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Return error for invalid credentials
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        });
      }
    }

    // Fallback for any other routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API Error:', error);
    // Return a generic error message for internal server errors
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}