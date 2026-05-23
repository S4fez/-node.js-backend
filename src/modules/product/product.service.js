const pool = require('../../database/connection');
const { AppError } = require('../../common/errors');

const getBasketballProducts = async () => {
  const result = await pool.query(
    'SELECT * FROM productbasketball WHERE record_status ILIKE $1',
    ['%A%']
  );
  return result.rows;
};

const getProductById = async (productId) => {
  const result = await pool.query(
    `SELECT pb.*, pd.*
     FROM productbrand pb
     LEFT JOIN productdetail pd ON pb.brand_id = pd.brand_id
     WHERE pd.product_id = $1`,
    [productId]
  );
  return result.rows;
};

const getProductsByBrand = async (brandId) => {
  const result = await pool.query(
    `SELECT *
     FROM productbrand
     LEFT JOIN productdetail ON productbrand.brand_id = productdetail.brand_id
     WHERE productbrand.brand_id = $1 AND productdetail.record_status ILIKE $2`,
    [brandId, '%A%']
  );
  return result.rows;
};

const getProductStore = async (productId) => {
  const result = await pool.query(
    `SELECT * FROM productdetail
     LEFT JOIN productstore ON productdetail.product_id = productstore.product_id
     WHERE productstore.product_id = $1
     ORDER BY productsize_id ASC`,
    [productId]
  );
  return result.rows;
};

const getCartItems = async (sizeIds) => {
  const result = await pool.query(
    `SELECT store.product_id, store.productsize_id, store.size, store.stock_size,
            detail.product_id, detail.nameproduct, detail.img, detail.price
     FROM productstore AS store
     LEFT JOIN productdetail AS detail ON store.product_id = detail.product_id
     WHERE productsize_id = ANY($1)`,
    [sizeIds]
  );
  return result.rows;
};

const processPayment = async (cartItems) => {
  const sizeIds = cartItems.map((item) => item.sizeId);

  const stockResult = await pool.query(
    'SELECT productsize_id, stock_size FROM productstore WHERE productsize_id = ANY($1::int[])',
    [sizeIds]
  );

  const hasInsufficientStock = cartItems.some((item) => {
    const dbItem = stockResult.rows.find((row) => row.productsize_id === item.sizeId);
    return dbItem && dbItem.stock_size < item.quantity;
  });

  if (hasInsufficientStock) {
    throw new AppError('The requested quantity is unavailable', 422);
  }

  const updateQuery = `
    UPDATE productstore
    SET stock_size = CASE
      ${cartItems.map((_, i) => `WHEN productsize_id = $${i * 2 + 1} THEN stock_size - $${i * 2 + 2}`).join(' ')}
    END
    WHERE productsize_id IN (${cartItems.map((_, i) => `$${i * 2 + 1}`).join(', ')})
  `;
  const updateParams = cartItems.flatMap((item) => [item.sizeId, item.quantity]);

  await pool.query(updateQuery, updateParams);
  return { status: 'success', code: 1, message: 'SUCCESS CASE' };
};

const searchProducts = async (name) => {
  const result = await pool.query(
    `SELECT * FROM productdetail WHERE nameproduct ILIKE '%' || $1 || '%'`,
    [name]
  );
  return result.rows;
};

module.exports = {
  getBasketballProducts,
  getProductById,
  getProductsByBrand,
  getProductStore,
  getCartItems,
  processPayment,
  searchProducts,
};
