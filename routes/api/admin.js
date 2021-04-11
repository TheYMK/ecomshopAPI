const express = require('express');
const router = express.Router();
// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { getAllOrders, orderStatus } = require('../../controllers/admin');

// routes
router.get('/admin/orders', authCheck, adminCheck, getAllOrders);
router.put('/admin/order-status', authCheck, adminCheck, orderStatus);

module.exports = router;
