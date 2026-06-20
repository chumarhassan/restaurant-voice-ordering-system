/**
 * Order Routes
 * Handles order management endpoints
 */

import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  cancelOrder,
  generateReceipt,
  getOrderStats
} from '../services/orderService.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req, res, next) => {
  try {
    const orderData = req.body;
    
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        error: { message: 'Order must contain at least one item' }
      });
    }
    
    const order = await createOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      orderType: req.query.orderType,
      date: req.query.date,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await getAllOrders(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getOrderStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:orderId
 * Get specific order
 */
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        error: { message: 'Order not found' }
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:orderId/receipt
 * Get order receipt HTML
 */
router.get('/:orderId/receipt', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        error: { message: 'Order not found' }
      });
    }
    
    const receiptHtml = generateReceipt(order);
    
    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.send(receiptHtml);
    } else {
      res.json({
        success: true,
        data: {
          orderId,
          receiptHtml
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:orderId
 * Update order
 */
router.patch('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;
    
    const order = await updateOrder(orderId, updates);
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 */
router.patch('/:orderId/status', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: { message: 'Status is required' }
      });
    }
    
    const order = await updateOrderStatus(orderId, status);
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/orders/:orderId
 * Cancel order
 */
router.delete('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body || {};
    
    const order = await cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'Order cancelled',
      data: order
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
});

export default router;
