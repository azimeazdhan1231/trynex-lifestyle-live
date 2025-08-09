import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Configure multer for image uploads
const imageUpload = multer({
  dest: 'uploads/orders/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Enhanced order schema with customization data
const createOrderSchema = insertOrderSchema.extend({
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(10),
  customer_address: z.string().min(5),
  total_amount: z.number().positive(),
  advance_payment: z.number().min(0),
  remaining_payment: z.number().min(0),
  payment_method: z.enum(['bkash', 'nagad', 'rocket']),
  customization_data: z.any().optional(),
  special_instructions: z.string().optional(),
  order_type: z.enum(['cart', 'direct']).default('direct'),
  status: z.enum(['pending_advance', 'advance_paid', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending_advance'),
  uploaded_images: z.array(z.string()).optional(),
});

// GET /api/orders - Get all orders with filters
router.get('/', async (req, res) => {
  try {
    const { status, customer_phone, order_type, limit = 50, offset = 0 } = req.query;
    
    const orders = await storage.getOrders({
      status: status as string,
      customer_phone: customer_phone as string,
      order_type: order_type as 'cart' | 'direct',
      limit: Number(limit),
      offset: Number(offset),
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storage.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    console.log('Creating new order with data:', req.body);
    
    const validatedData = createOrderSchema.parse(req.body);
    
    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData: InsertOrder = {
      id: orderId,
      product_id: validatedData.product_id,
      product_name: validatedData.product_name,
      customer_name: validatedData.customer_name,
      customer_phone: validatedData.customer_phone,
      customer_address: validatedData.customer_address,
      total_amount: validatedData.total_amount,
      advance_payment: validatedData.advance_payment || 0,
      remaining_payment: validatedData.remaining_payment || validatedData.total_amount,
      payment_method: validatedData.payment_method,
      customization_data: JSON.stringify(validatedData.customization_data || {}),
      special_instructions: validatedData.special_instructions || '',
      order_type: validatedData.order_type,
      status: validatedData.status,
      uploaded_images: JSON.stringify(validatedData.uploaded_images || []),
      created_at: new Date().toISOString(),
    };
    
    const newOrder = await storage.createOrder(orderData);
    
    console.log('Order created successfully:', newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/orders/:id/upload-image - Upload images for order
router.post('/:id/upload-image', imageUpload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    
    const order = await storage.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Store file paths
    const imagePaths = files.map(file => file.path);
    const existingImages = order.uploaded_images ? JSON.parse(order.uploaded_images) : [];
    const allImages = [...existingImages, ...imagePaths];
    
    // Update order with image paths
    await storage.updateOrder(id, {
      uploaded_images: JSON.stringify(allImages)
    });
    
    res.json({ 
      message: 'Images uploaded successfully',
      images: imagePaths 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Updating order:', id, 'with data:', updateData);
    
    const existingOrder = await storage.getOrderById(id);
    if (!existingOrder) {
      console.error('❌ Order not found:', id);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Add timestamp for status updates
    if (updateData.status) {
      updateData.updated_at = new Date().toISOString();
    }
    
    const updatedOrder = await storage.updateOrder(id, updateData);
    console.log('✅ Order updated successfully:', updatedOrder);
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ 
      error: 'Failed to update order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/orders/:id/download-images - Download order images
router.get('/:id/download-images', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storage.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const images = order.uploaded_images ? JSON.parse(order.uploaded_images) : [];
    
    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found for this order' });
    }
    
    // For now, return the list of images
    // In a real implementation, you'd create a ZIP file or provide download links
    res.json({ 
      order_id: id,
      images: images,
      download_urls: images.map((img: string) => `/uploads/orders/${path.basename(img)}`)
    });
  } catch (error) {
    console.error('Error downloading images:', error);
    res.status(500).json({ error: 'Failed to download images' });
  }
});

// DELETE /api/orders/:id - Delete order (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingOrder = await storage.getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await storage.deleteOrder(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;