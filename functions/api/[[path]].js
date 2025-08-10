// Cloudflare Pages Functions - API Routes Handler
// Simplified and optimized for Cloudflare Workers runtime

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Log for debugging in Cloudflare dashboard
  console.log(`${method} ${path}`);

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  // Handle preflight requests
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase configuration - using REST API instead of direct postgres connection
    const SUPABASE_URL = env.SUPABASE_URL || 'https://lxhhgdqfxmeohayceshb.supabase.co';
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTk1OTAsImV4cCI6MjA2OTQ3NTU5MH0.gW9X6igqtpAQKutqb4aEEx0VovEZdMp4Gk_R8Glm9Bw';
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg5OTU5MCwiZXhwIjoyMDY5NDc1NTkwfQ.zsYuh0P2S97pLrvY6t1j-qw-j-R_-_5QQX7e423dDeU';

    // Helper function for Supabase API calls
    async function supabaseRequest(endpoint, options = {}) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${options.serviceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...options.headers
        },
        ...options
      });
      return await response.json();
    }

    // Products routes - OPTIMIZED with caching
    if (path === "/api/products" && method === "GET") {
      const data = await supabaseRequest('products?select=*&order=created_at.desc');
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, max-age=300"
        }
      });
    }

    if (path === "/api/products" && method === "POST") {
      const body = await request.json();
      const { name, price, image_url, category, stock } = body;
      
      if (!name || !price || !category) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const productData = {
        name,
        price,
        image_url: image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category,
        stock: Number(stock) || 0
      };

      const data = await supabaseRequest('products', {
        method: 'POST',
        body: JSON.stringify(productData),
        serviceKey: true
      });
      
      // Cache invalidation headers for live updates
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": "/api/products"
        }
      });
    }

    if (path.startsWith("/api/products/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const data = await supabaseRequest(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        serviceKey: true
      });
      
      // Cache invalidation for live updates
      return new Response(JSON.stringify(data[0]), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": "/api/products"
        }
      });
    }

    if (path.startsWith("/api/products/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`products?id=eq.${id}`, {
        method: 'DELETE',
        serviceKey: true
      });
      
      // Cache invalidation for live updates
      return new Response(JSON.stringify({ message: "Product deleted successfully" }), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": "/api/products"
        }
      });
    }

    // Orders routes - OPTIMIZED with caching
    if (path === "/api/orders" && method === "GET") {
      const data = await supabaseRequest('orders?select=*&order=created_at.desc');
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60"
        }
      });
    }

    if (path === "/api/orders" && method === "POST") {
      const body = await request.json();
      const { customer_name, phone, district, thana, address, items, total } = body;
      
      const tracking_id = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const orderData = {
        tracking_id,
        customer_name,
        phone,
        district,
        thana,
        address,
        items: JSON.stringify(items),
        total,
        status: 'pending'
      };

      const data = await supabaseRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/orders/") && !path.includes("/status") && method === "GET") {
      const trackingId = path.split("/")[3];
      console.log('Tracking ID requested:', trackingId);
      
      const data = await supabaseRequest(`orders?tracking_id=eq.${trackingId}`);
      console.log('Order data found:', data.length > 0 ? 'YES' : 'NO');
      
      if (data.length === 0) {
        return new Response(JSON.stringify({ error: "Order not found", tracking_id: trackingId }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Parse items if they're stored as JSON string
      const order = data[0];
      if (typeof order.items === 'string') {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          console.error('Error parsing order items:', e);
        }
      }
      
      return new Response(JSON.stringify(order), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=10, stale-while-revalidate=30"
        }
      });
    }

    if (path.includes("/status") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      const { status } = body;
      
      if (!status) {
        return new Response(JSON.stringify({ error: "Status is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      const data = await supabaseRequest(`orders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        serviceKey: true
      });
      
      // Cache invalidation for live order updates  
      return new Response(JSON.stringify(data[0]), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": `/api/orders,/api/orders/${data[0]?.tracking_id}`
        }
      });
    }

    // Offers routes
    if (path === "/api/offers" && method === "GET") {
      const active = url.searchParams.get("active");
      let endpoint = 'offers?select=*&order=created_at.desc';
      
      if (active === "true") {
        endpoint = 'offers?select=*&is_active=eq.true&order=created_at.desc';
      }
      
      const data = await supabaseRequest(endpoint);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/offers" && method === "POST") {
      const body = await request.json();
      const { title, description, discount_percentage, min_order_amount, max_discount_amount, expires_at, is_active } = body;
      
      const offerData = {
        title,
        description,
        discount_percentage: Number(discount_percentage),
        min_order_amount: min_order_amount ? Number(min_order_amount) : null,
        max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
        expires_at: expires_at || null,
        is_active: Boolean(is_active)
      };

      const data = await supabaseRequest('offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/offers/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const data = await supabaseRequest(`offers?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/offers/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`offers?id=eq.${id}`, {
        method: 'DELETE',
        serviceKey: true
      });
      
      return new Response(JSON.stringify({ message: "Offer deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Admin routes - FIXED for JWT authentication
    if (path === "/api/admin/login" && method === "POST") {
      const body = await request.json();
      const { email, password } = body;
      
      if (!email || !password) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'ইমেইল এবং পাসওয়ার্ড দিন' 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // For demo purposes - in production, hash the password in database
      if (email === 'admin@trynex.com' && password === 'admin123') {
        // Generate JWT token
        const JWT_SECRET = env.JWT_SECRET || 'trynex_secret_key_2025';
        
        // Simple JWT implementation for Cloudflare Workers
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
          id: 'admin',
          email: 'admin@trynex.com',
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        }));
        
        // For production, use proper HMAC-SHA256 signing
        const token = `${header}.${payload}.${btoa('signature')}`;
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'এডমিন লগইন সফল',
          token: token,
          admin: {
            id: 'admin',
            email: 'admin@trynex.com',
            role: 'admin'
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'ভুল ইমেইল বা পাসওয়ার্ড' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Admin token verification
    if (path === "/api/admin/verify" && method === "GET") {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No token provided' }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // For demo - in production, verify JWT properly
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Categories routes
    if (path === "/api/categories" && method === "GET") {
      const data = await supabaseRequest('categories?select=*&order=name.asc');
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    if (path === "/api/categories" && method === "POST") {
      const body = await request.json();
      const { name, name_bengali, description } = body;
      
      if (!name) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const categoryData = {
        name,
        name_bengali: name_bengali || null,
        description: description || null
      };

      const data = await supabaseRequest('categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/categories/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const data = await supabaseRequest(`categories?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/categories/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`categories?id=eq.${id}`, {
        method: 'DELETE',
        serviceKey: true
      });
      
      return new Response(JSON.stringify({ message: "Category deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Promo codes routes
    if (path === "/api/promo-codes" && method === "GET") {
      const data = await supabaseRequest('promo_codes?select=*&order=created_at.desc');
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    if (path === "/api/promo-codes" && method === "POST") {
      const body = await request.json();
      const { code, discount_percentage, discount_type, min_order_amount, max_discount_amount, expires_at, is_active, usage_limit } = body;
      
      if (!code || !discount_percentage) {
        return new Response(JSON.stringify({ error: "Code and discount percentage are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const promoData = {
        code: code.toUpperCase(),
        discount_percentage: Number(discount_percentage),
        discount_type: discount_type || 'percentage',
        min_order_amount: min_order_amount ? Number(min_order_amount) : null,
        max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
        expires_at: expires_at || null,
        is_active: Boolean(is_active),
        usage_limit: usage_limit ? Number(usage_limit) : null,
        usage_count: 0
      };

      const data = await supabaseRequest('promo_codes', {
        method: 'POST',
        body: JSON.stringify(promoData),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/promo-codes/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const data = await supabaseRequest(`promo_codes?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        serviceKey: true
      });
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/promo-codes/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`promo_codes?id=eq.${id}`, {
        method: 'DELETE',
        serviceKey: true
      });
      
      return new Response(JSON.stringify({ message: "Promo code deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Admin verification route - FIXED
    if (path === "/api/admin/verify" && method === "GET") {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No token provided' }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // For demo - return admin info
      return new Response(JSON.stringify({ 
        success: true,
        admin: {
          id: 'admin',
          email: 'admin@trynex.com',
          role: 'admin'
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Settings route
    if (path === "/api/settings" && method === "GET") {
      return new Response(JSON.stringify({
        site_name: "Trynex Lifestyle",
        google_analytics_id: env.GOOGLE_ANALYTICS_ID || "XXXXXXXXXXXX",
        facebook_pixel_id: env.FACEBOOK_PIXEL_ID || "XXXXXXXXXXXX"
      }), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600" 
        }
      });
    }
    
    // Health check endpoint
    if (path === "/api/health" && method === "GET") {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Default 404 response
    return new Response(JSON.stringify({ error: "Route not found", path, method }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message,
      path: path,
      method: method
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}