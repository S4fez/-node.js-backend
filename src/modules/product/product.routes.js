const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/productbasketball', productController.getBasketballProducts);
router.get('/productdetail/:productid', productController.getProductById);
router.get('/productbrand/:brandid', productController.getProductsByBrand);
router.get('/productstore/:productid', productController.getProductStore);
router.post('/productstore/bucket', productController.getCartItems);
router.post('/productstore/paybucket', productController.processPayment);
router.post('/search', productController.searchProducts);

module.exports = router;
