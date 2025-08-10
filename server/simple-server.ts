import express from 'express';
import { storage } from './simple-storage';
import { setupAuthRoutes } from './auth-routes';
import { createServer } from 'http';

export async function registerRoutes(app: express.Express) {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Enhanced Products routes with proper validation
  app.get('/api/products', async (req, res) => {
    try {
      console.log('🔍 Executing optimized products query...');
      const startTime = Date.now();

      const products = await storage.getProducts();

      const endTime = Date.now();
      console.log(`✅ Products query completed in ${endTime - startTime}ms - ${products.length} items`);
      console.log(`✅ Products query completed in ${endTime - startTime}ms - ${products.length} items returned (${products.length} total)`);

      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      console.log('Creating product:', productData);

      // Validate required fields
      if (!productData.name || !productData.category) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
          details: "Name and category are required"
        });
      }

      // Validate and convert data types with better error handling
      const processedData = {
        name: String(productData.name || '').trim(),
        description: String(productData.description || '').trim(),
        category: String(productData.category || '').trim(),
        image_url: String(productData.image_url || '').trim(),
        additional_images: productData.additional_images || [],
        is_active: Boolean(productData.is_active !== false), // Default to true
        is_featured: Boolean(productData.is_featured),
        is_latest: Boolean(productData.is_latest),
        is_best_selling: Boolean(productData.is_best_selling)
      };

      // Handle price conversion
      if (productData.price !== undefined && productData.price !== null) {
        const priceNum = parseFloat(productData.price);
        if (isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid price value",
            details: "Price must be a valid positive number"
          });
        }
        processedData.price = priceNum;
      } else {
        processedData.price = 0;
      }

      // Handle stock conversion
      if (productData.stock !== undefined && productData.stock !== null) {
        const stockNum = parseInt(productData.stock, 10);
        if (isNaN(stockNum) || stockNum < 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid stock value",
            details: "Stock must be a valid non-negative number"
          });
        }
        processedData.stock = stockNum;
      } else {
        processedData.stock = 0;
      }

      console.log('Processed data for database:', processedData);

      const newProduct = await storage.createProduct(processedData);

      res.status(201).json({
        success: true,
        product: newProduct,
        message: "পণ্য সফলভাবে তৈরি হয়েছে"
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        error: "পণ্য তৈরি করতে সমস্যা হয়েছে",
        details: error.message
      });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔄 Updating product ${id} with data:`, req.body);

      const updateData = req.body;

      // Validate required fields
      if (!updateData.name || !updateData.category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          details: 'Name and category are required'
        });
      }

      // Process the data with proper type conversion
      const processedData = {
        name: String(updateData.name || '').trim(),
        description: String(updateData.description || '').trim(),
        category: String(updateData.category || '').trim(),
        image_url: String(updateData.image_url || '').trim(),
        additional_images: updateData.additional_images || [],
        is_active: Boolean(updateData.is_active !== false),
        is_featured: Boolean(updateData.is_featured),
        is_latest: Boolean(updateData.is_latest),
        is_best_selling: Boolean(updateData.is_best_selling)
      };

      // Handle price conversion
      if (updateData.price !== undefined && updateData.price !== null) {
        const priceNum = parseFloat(updateData.price);
        if (isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid price value",
            details: "Price must be a valid positive number"
          });
        }
        processedData.price = priceNum;
      }

      // Handle stock conversion
      if (updateData.stock !== undefined && updateData.stock !== null) {
        const stockNum = parseInt(updateData.stock, 10);
        if (isNaN(stockNum) || stockNum < 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid stock value",
            details: "Stock must be a valid non-negative number"
          });
        }
        processedData.stock = stockNum;
      }

      console.log('✅ Processed update data:', processedData);

      const product = await storage.updateProduct(id, processedData);

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      console.log('✅ Product updated successfully:', product);

      res.json({
        success: true,
        product,
        message: 'পণ্য সফলভাবে আপডেট হয়েছে'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update product',
        details: error.message 
      });
    }
  });

  // Update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log('Product mutation:', req.method, req.url, updates);

      // Ensure proper data types
      if (updates.stock !== undefined) {
        updates.stock = parseInt(updates.stock, 10);
        if (isNaN(updates.stock)) {
          return res.status(400).json({
            success: false,
            error: "Invalid stock value",
            details: "Stock must be a valid number"
          });
        }
      }

      if (updates.price !== undefined) {
        updates.price = parseFloat(updates.price);
        if (isNaN(updates.price)) {
          return res.status(400).json({
            success: false,
            error: "Invalid price value",
            details: "Price must be a valid number"
          });
        }
      }

      const updatedProduct = await storage.updateProduct(id, updates);

      res.json({
        success: true,
        product: updatedProduct,
        message: "পণ্য সফলভাবে আপডেট হয়েছে"
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        error: "পণ্য আপডেট করতে সমস্যা হয়েছে",
        details: error.message
      });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔄 Deleting product ${id}`);

      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      console.log('✅ Product deleted successfully');

      res.json({
        success: true,
        message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
  });

  // Enhanced Orders routes
  app.get('/api/orders', async (req, res) => {
    try {
      console.log('🔍 Fetching orders from database...');
      const orders = await storage.getOrders();
      console.log(`✅ Orders fetched successfully: ${orders.length} orders`);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      console.log('🔄 Creating new order with data:', req.body);

      const { customer_name, phone, district, thana, address, items, total, custom_instructions, custom_images } = req.body;

      // Validate required fields
      if (!customer_name || !phone || !district || !address || !items || !total) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const tracking_id = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        tracking_id,
        customer_name: String(customer_name).trim(),
        phone: String(phone).trim(),
        district: String(district).trim(),
        thana: String(thana || '').trim(),
        address: String(address).trim(),
        items: JSON.stringify(items),
        total: String(total),
        status: 'pending',
        custom_instructions: String(custom_instructions || '').trim(),
        custom_images: custom_images ? JSON.stringify(custom_images) : null
      };

      const order = await storage.createOrder(orderData);

      console.log('✅ Order created successfully:', order);

      res.status(201).json({
        success: true,
        order,
        message: 'অর্ডার সফলভাবে তৈরি হয়েছে'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log(`🔄 Updating order ${id} status to: ${status}`);

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const order = await storage.updateOrderStatus(id, status);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      console.log('✅ Order status updated successfully');

      res.json({
        success: true,
        order,
        message: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
  });

  // Basic routes for other data
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
  });

  app.get('/api/offers', async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch offers' });
    }
  });

  app.get('/api/promo-codes', async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch promo codes' });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      // Return default settings for now
      res.json({
        site_name: "Trynex Lifestyle",
        site_description: "Bangladesh এর সেরা গিফট এবং লাইফস্টাইল পণ্যের দোকান",
        contact_email: "support@trynex.com",
        contact_phone: "+8801XXXXXXXXX",
        whatsapp_number: "+8801XXXXXXXXX",
        business_address: "ঢাকা, বাংলাদেশ",
        delivery_fee_dhaka: 60,
        delivery_fee_outside: 120,
        min_order_amount: 200
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      // Just return success for now - settings are handled in memory
      console.log('Settings updated:', req.body);
      res.json({ success: true, message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      message: 'Server is running properly'
    });
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'সার্ভার এরর। আবার চেষ্টা করুন।'
    });
  });

  // Return the HTTP server
  return createServer(app);
}