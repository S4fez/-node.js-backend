const productService = require('./product.service');
const { success } = require('../../helpers/response.helper');
const { HTTP_STATUS } = require('../../common/constants');

const getBasketballProducts = async (req, res, next) => {
  try {
    const data = await productService.getBasketballProducts();
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const data = await productService.getProductById(req.params.productid);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getProductsByBrand = async (req, res, next) => {
  try {
    const data = await productService.getProductsByBrand(req.params.brandid);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getProductStore = async (req, res, next) => {
  try {
    const data = await productService.getProductStore(req.params.productid);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getCartItems = async (req, res, next) => {
  try {
    const data = await productService.getCartItems(req.body.sizeId);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const processPayment = async (req, res, next) => {
  try {
    const result = await productService.processPayment(req.body);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'กรุณาระบุชื่อรุ่น (name)' });
    }
    const data = await productService.searchProducts(name);
    success(res, data);
  } catch (err) {
    next(err);
  }
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
