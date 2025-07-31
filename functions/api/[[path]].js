// Cloudflare Pages Functions - API Routes Handler
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
    // Supabase configuration
    const SUPABASE_URL = "https://lxhhgdqfxmeohayceshb.supabase.co";
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg5OTU5MCwiZXhwIjoyMDY5NDc1NTkwfQ.zsYuh0P2S97pLrvY6t1j-qw-j-R_-_5QQX7e423dDeU";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTk1OTAsImV4cCI6MjA2OTQ3NTU5MH0.gW9X6igqtpAQKutqb4aEEx0VovEZdMp4Gk_R8Glm9Bw";

    // Helper function to make Supabase requests
    const supabaseRequest = async (endpoint, options = {}) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Supabase request failed: ${response.status}`);
      }

      return response;
    };

    // Initialize categories if needed
    if (path === "/api/init-categories" && method === "GET") {
      const categoriesResponse = await supabaseRequest('categories');
      const categories = await categoriesResponse.json();

      if (categories.length === 0) {
        const defaultCategories = [
          { name: "gifts", name_bengali: "গিফট", description: "Special gift items", is_active: true, sort_order: 1 },
          { name: "lifestyle", name_bengali: "লাইফস্টাইল", description: "Lifestyle products", is_active: true, sort_order: 2 },
          { name: "accessories", name_bengali: "অ্যাক্সেসরিজ", description: "Fashion accessories", is_active: true, sort_order: 3 },
          { name: "custom", name_bengali: "কাস্টম", description: "Custom products", is_active: true, sort_order: 4 },
          { name: "electronics", name_bengali: "ইলেক্ট্রনিক্স", description: "Electronic gadgets", is_active: true, sort_order: 5 }
        ];

        for (const category of defaultCategories) {
          await supabaseRequest('categories', {
            method: 'POST',
            body: JSON.stringify(category)
          });
        }
      }

      return new Response(JSON.stringify({ message: "Categories initialized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Products API
    if (path === "/api/products" && method === "GET") {
      const { category } = Object.fromEntries(url.searchParams);
      let endpoint = 'products';

      if (category && category !== 'all') {
        endpoint += `?category=eq.${category}`;
      }

      const response = await supabaseRequest(endpoint);
      const products = await response.json();

      return new Response(JSON.stringify(products), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Single product
    if (path.startsWith("/api/products/") && method === "GET") {
      const id = path.split("/")[3];
      const response = await supabaseRequest(`products?id=eq.${id}`);
      const products = await response.json();
      const product = products[0];

      if (!product) {
        return new Response(JSON.stringify({ message: "Product not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify(product), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create product
    if (path === "/api/products" && method === "POST") {
      const body = await request.json();
      const response = await supabaseRequest('products', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Prefer': 'return=representation' }
      });

      const product = await response.json();
      return new Response(JSON.stringify(product[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Update product
    if (path.startsWith("/api/products/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();

      const response = await supabaseRequest(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: { 'Prefer': 'return=representation' }
      });

      const product = await response.json();
      return new Response(JSON.stringify(product[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Delete product
    if (path.startsWith("/api/products/") && method === "DELETE") {
      const id = path.split("/")[3];
      await supabaseRequest(`products?id=eq.${id}`, { method: 'DELETE' });

      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Categories API
    if (path === "/api/categories" && method === "GET") {
      const response = await supabaseRequest('categories');
      const categories = await response.json();

      return new Response(JSON.stringify(categories), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Orders API
    if (path === "/api/orders" && method === "GET") {
      const response = await supabaseRequest('orders?order=created_at.desc');
      const orders = await response.json();

      return new Response(JSON.stringify(orders), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get single order by tracking ID
    if (path.startsWith("/api/orders/") && method === "GET") {
      const trackingId = path.split("/")[3];
      const response = await supabaseRequest(`orders?tracking_id=eq.${trackingId}`);
      const orders = await response.json();
      const order = orders[0];

      if (!order) {
        return new Response(JSON.stringify({ message: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create order
    if (path === "/api/orders" && method === "POST") {
      const body = await request.json();

      // Generate tracking ID
      const trackingId = 'TRX' + Date.now().toString().slice(-8);
      const orderData = { ...body, tracking_id: trackingId };

      const response = await supabaseRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Prefer': 'return=representation' }
      });

      const order = await response.json();
      return new Response(JSON.stringify(order[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Update order status
    if (path.startsWith("/api/orders/") && (method === "PATCH" || path.includes("/status"))) {
      const id = path.split("/")[3];
      const body = await request.json();

      const response = await supabaseRequest(`orders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: body.status }),
        headers: { 'Prefer': 'return=representation' }
      });

      const order = await response.json();
      return new Response(JSON.stringify(order[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Offers API
    if (path === "/api/offers" && method === "GET") {
      const { active } = Object.fromEntries(url.searchParams);
      let endpoint = 'offers';

      if (active === "true") {
        endpoint += '?is_active=eq.true';
      }

      const response = await supabaseRequest(endpoint);
      const offers = await response.json();

      return new Response(JSON.stringify(offers), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Admin login
    if (path === "/api/admin/login" && method === "POST") {
      const { email, password } = await request.json();

      if (!email || !password) {
        return new Response(JSON.stringify({ message: "Email and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const response = await supabaseRequest(`admins?email=eq.${email}`);
      const admins = await response.json();
      const admin = admins[0];

      if (!admin || admin.password !== password) {
        return new Response(JSON.stringify({ message: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        admin: { id: admin.id, email: admin.email } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Default response for unmatched routes
    return new Response(JSON.stringify({ message: "Route not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}