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
	getOrders,
	addToWishList,
	getUserWishlist,
	removeFromWishlist,
	createCashOrder
} = require('../../controllers/user');

router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.delete('/user/cart', authCheck, emptyCart);
router.post('/user/address', authCheck, saveAddress);
// coupon
router.put('/user/cart/coupon', authCheck, applyCouponToUserCart);

// order
router.post('/user/order', authCheck, createOrder); // stripe
router.get('/user/orders', authCheck, getOrders);
router.post('/user/cash-order', authCheck, createCashOrder); // cash on delivery

// wishlist
router.post('/user/wishlist', authCheck, addToWishList);
router.get('/user/wishlist', authCheck, getUserWishlist);
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist);

module.exports = router;
