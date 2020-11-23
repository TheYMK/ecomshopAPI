const express = require('express');
const router = express.Router();
// middlewares
const { authCheck } = require('../../middlewares/auth');
// controllers
const {
	userCart,
	getUserCart,
	emptyCart,
	saveAddress,
	applyCouponToUserCart,
	createOrder,
	getOrders
} = require('../../controllers/user');

router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.delete('/user/cart', authCheck, emptyCart);
router.post('/user/address', authCheck, saveAddress);
// coupon
router.put('/user/cart/coupon', authCheck, applyCouponToUserCart);

// order
router.post('/user/order', authCheck, createOrder);
router.get('/user/orders', authCheck, getOrders);

module.exports = router;
