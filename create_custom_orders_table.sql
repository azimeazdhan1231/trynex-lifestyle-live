
CREATE TABLE IF NOT EXISTS custom_orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  customization TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  trx_id VARCHAR(100),
  payment_screenshot TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
