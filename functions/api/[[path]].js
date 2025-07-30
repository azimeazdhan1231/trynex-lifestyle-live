// Cloudflare Pages Functions - API Routes Handler
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte, sql } from "drizzle-orm";

// Database Schema
const products = {
  id: "id",
  name: "name", 
  price: "price",
  image_url: "image_url",
  category: "category",
  stock: "stock",
  created_at: "created_at"
};

const orders = {
  id: "id",
  tracking_id: "tracking_id",
  customer_name: "customer_name",
  phone: "phone",
  district: "district", 
  thana: "thana",
  address: "address",
  status: "status",
  items: "items",
  total: "total",
  payment_info: "payment_info",
  created_at: "created_at"
};

const offers = {
  id: "id",
  title: "title",
  description: "description",
  discount_percentage: "discount_percentage",
  min_order_amount: "min_order_amount",
  max_discount_amount: "max_discount_amount",
  expires_at: "expires_at",
  is_active: "is_active",
  created_at: "created_at"
};

const admins = {
  id: "id",
  email: "email",
  password: "password",
  name: "name",
  created_at: "created_at"
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight requests
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Database connection
    const connectionString = env.DATABASE_URL;
    if (!connectionString) {
      return new Response(JSON.stringify({ error: "Database connection not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    // Route handling
    if (path === "/api/products" && method === "GET") {
      const result = await db.execute(sql`SELECT * FROM products ORDER BY created_at DESC`);
      return new Response(JSON.stringify(result.rows), {
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

      const result = await db.execute(sql`
        INSERT INTO products (name, price, image_url, category, stock) 
        VALUES (${name}, ${price}, ${image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}, ${category}, ${Number(stock) || 0})
        RETURNING *
      `);
      
      return new Response(JSON.stringify(result.rows[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/products/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      if (body.name) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(body.name);
      }
      if (body.price) {
        updateFields.push(`price = $${paramIndex++}`);
        values.push(body.price);
      }
      if (body.image_url) {
        updateFields.push(`image_url = $${paramIndex++}`);
        values.push(body.image_url);
      }
      if (body.category) {
        updateFields.push(`category = $${paramIndex++}`);
        values.push(body.category);
      }
      if (body.stock !== undefined) {
        updateFields.push(`stock = $${paramIndex++}`);
        values.push(Number(body.stock));
      }
      
      values.push(id);
      
      const result = await db.execute(sql.raw(`
        UPDATE products SET ${updateFields.join(", ")} 
        WHERE id = $${paramIndex}
        RETURNING *
      `, values));
      
      return new Response(JSON.stringify(result.rows[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/products/") && method === "DELETE") {
      const id = path.split("/")[3];
      await db.execute(sql`DELETE FROM products WHERE id = ${id}`);
      
      return new Response(JSON.stringify({ message: "Product deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/orders" && method === "GET") {
      const result = await db.execute(sql`SELECT * FROM orders ORDER BY created_at DESC`);
      return new Response(JSON.stringify(result.rows), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/orders" && method === "POST") {
      const body = await request.json();
      const { customer_name, phone, district, thana, address, items, total } = body;
      
      const tracking_id = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const result = await db.execute(sql`
        INSERT INTO orders (tracking_id, customer_name, phone, district, thana, address, items, total, status) 
        VALUES (${tracking_id}, ${customer_name}, ${phone}, ${district}, ${thana}, ${address}, ${JSON.stringify(items)}, ${total}, 'pending')
        RETURNING *
      `);
      
      return new Response(JSON.stringify(result.rows[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/orders/") && !path.includes("/status") && method === "GET") {
      const trackingId = path.split("/")[3];
      const result = await db.execute(sql`SELECT * FROM orders WHERE tracking_id = ${trackingId} LIMIT 1`);
      
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify(result.rows[0]), {
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
      
      const result = await db.execute(sql`
        UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *
      `);
      
      return new Response(JSON.stringify(result.rows[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/offers" && method === "GET") {
      const active = url.searchParams.get("active");
      
      let query;
      if (active === "true") {
        query = sql`SELECT * FROM offers WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC`;
      } else {
        query = sql`SELECT * FROM offers ORDER BY created_at DESC`;
      }
      
      const result = await db.execute(query);
      return new Response(JSON.stringify(result.rows), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/offers" && method === "POST") {
      const body = await request.json();
      const { title, description, discount_percentage, min_order_amount, max_discount_amount, expires_at, is_active } = body;
      
      const result = await db.execute(sql`
        INSERT INTO offers (title, description, discount_percentage, min_order_amount, max_discount_amount, expires_at, is_active) 
        VALUES (${title}, ${description}, ${Number(discount_percentage)}, ${min_order_amount ? Number(min_order_amount) : null}, ${max_discount_amount ? Number(max_discount_amount) : null}, ${expires_at || null}, ${Boolean(is_active)})
        RETURNING *
      `);
      
      return new Response(JSON.stringify(result.rows[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/offers/") && method === "PATCH") {
      const id = path.split("/")[3];
      const body = await request.json();
      
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      if (body.title) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(body.title);
      }
      if (body.description) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(body.description);
      }
      if (body.discount_percentage !== undefined) {
        updateFields.push(`discount_percentage = $${paramIndex++}`);
        values.push(Number(body.discount_percentage));
      }
      if (body.min_order_amount !== undefined) {
        updateFields.push(`min_order_amount = $${paramIndex++}`);
        values.push(body.min_order_amount ? Number(body.min_order_amount) : null);
      }
      if (body.max_discount_amount !== undefined) {
        updateFields.push(`max_discount_amount = $${paramIndex++}`);
        values.push(body.max_discount_amount ? Number(body.max_discount_amount) : null);
      }
      if (body.expires_at !== undefined) {
        updateFields.push(`expires_at = $${paramIndex++}`);
        values.push(body.expires_at);
      }
      if (body.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        values.push(Boolean(body.is_active));
      }
      
      values.push(id);
      
      const result = await db.execute(sql.raw(`
        UPDATE offers SET ${updateFields.join(", ")} 
        WHERE id = $${paramIndex}
        RETURNING *
      `, values));
      
      return new Response(JSON.stringify(result.rows[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path.startsWith("/api/offers/") && method === "DELETE") {
      const id = path.split("/")[3];
      await db.execute(sql`DELETE FROM offers WHERE id = ${id}`);
      
      return new Response(JSON.stringify({ message: "Offer deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (path === "/api/admins/login" && method === "POST") {
      const body = await request.json();
      const { email, password } = body;
      
      const result = await db.execute(sql`SELECT * FROM admins WHERE email = ${email} AND password = ${password} LIMIT 1`);
      
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ success: true, admin: result.rows[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Default 404 response
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}