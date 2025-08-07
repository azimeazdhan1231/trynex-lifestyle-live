// Cloudflare Pages Functions - API Routes Handler
// Simplified and optimized for Cloudflare Workers runtime

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

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

    // Products routes
    if (path === "/api/products" && method === "GET") {
      const data = await supabaseRequest('products?select=*&order=created_at.desc');
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
      
      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/products/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`products?id=eq.${id}`, {
        method: 'DELETE',
        serviceKey: true
      });
      
      return new Response(JSON.stringify({ message: "Product deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Orders routes
    if (path === "/api/orders" && method === "GET") {
      const data = await supabaseRequest('orders?select=*&order=created_at.desc');
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
      const data = await supabaseRequest(`orders?tracking_id=eq.${trackingId}`);
      
      if (data.length === 0) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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

    // Admin routes
    if (path === "/api/admins/login" && method === "POST") {
      const body = await request.json();
      const { email, password } = body;
      
      const data = await supabaseRequest(`admins?email=eq.${email}&password=eq.${password}`);
      
      if (data.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ success: true, admin: data[0] }), {
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
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}