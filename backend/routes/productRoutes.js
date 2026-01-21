import express from 'express';
import {
  getProducts,
  getProductById,
  getSimilarProducts,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;