const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const roleCheck = require('../../middleware/roleCheck.middleware');
const upload = require('../../middleware/upload.middleware');

// ─── Public (authenticated) routes ─────────────────────────────────────────────
router.get('/productbasketball', productController.getBasketballProducts);
router.get('/productdetail/:productid', productController.getProductById);
router.get('/productbrand/:brandid', productController.getProductsByBrand);
router.get('/productstore/:productid', productController.getProductStore);
router.post('/productstore/bucket', productController.getCartItems);
router.post('/productstore/paybucket', productController.processPayment);
router.post('/search', productController.searchProducts);

// ─── SuperAdmin & Admin only routes (sys_role: 0=SuperAdmin, 1=Admin) ──────────
router.get('/admin/brands', roleCheck([0, 1]), productController.getAllBrands);
router.get('/admin/products', roleCheck([0, 1]), productController.getAllProductsAdmin);
router.post('/admin/products', roleCheck([0, 1]), upload.single('img'), productController.createProduct);
router.put('/admin/products/:productid', roleCheck([0, 1]), upload.single('img'), productController.updateProduct);
router.delete('/admin/products/:productid', roleCheck([0, 1]), productController.deleteProduct);

module.exports = router;
