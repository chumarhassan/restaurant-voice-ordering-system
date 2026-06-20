/**
 * Menu Routes
 * Serves restaurant menu data
 */

import express from 'express';
import { menu, searchMenuItem, getMenuItemById, getAllItems } from '../data/menu.js';

const router = express.Router();

/**
 * GET /api/menu
 * Get full menu
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: menu
  });
});

/**
 * GET /api/menu/categories
 * Get menu categories
 */
router.get('/categories', (req, res) => {
  const categories = menu.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    nameEn: cat.nameEn,
    description: cat.description,
    itemCount: cat.items.length
  }));
  
  res.json({
    success: true,
    data: categories
  });
});

/**
 * GET /api/menu/category/:categoryId
 * Get items in a specific category
 */
router.get('/category/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const category = menu.categories.find(c => c.id === categoryId);
  
  if (!category) {
    return res.status(404).json({
      error: { message: 'Category not found' }
    });
  }
  
  res.json({
    success: true,
    data: category
  });
});

/**
 * GET /api/menu/item/:itemId
 * Get specific menu item
 */
router.get('/item/:itemId', (req, res) => {
  const { itemId } = req.params;
  const item = getMenuItemById(itemId);
  
  if (!item) {
    return res.status(404).json({
      error: { message: 'Item not found' }
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

/**
 * GET /api/menu/search
 * Search menu items
 */
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      error: { message: 'Search query must be at least 2 characters' }
    });
  }
  
  const results = searchMenuItem(q.trim());
  
  res.json({
    success: true,
    data: {
      query: q,
      results,
      count: results.length
    }
  });
});

/**
 * GET /api/menu/items
 * Get all items as flat list
 */
router.get('/items', (req, res) => {
  const items = getAllItems();
  
  res.json({
    success: true,
    data: items
  });
});

/**
 * GET /api/menu/info
 * Get restaurant info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: menu.restaurant
  });
});

export default router;
