const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const {
	create,
	listAll,
	remove,
	read,
	getAllProducts,
	update,
	list,
	productsTotalCount,
	productRating
} = require('../../controllers/product');

// routes

router.post('/product', authCheck, adminCheck, create);
router.get('/products/total', productsTotalCount);
router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/product/:slug', read);
// this was supposed to be used in getstaticpaths function
router.get('/products', getAllProducts);
router.put('/product/:slug', authCheck, adminCheck, update);
// this one will help in fetching products for the home page based on new arrivals and best sellers
router.post('/products/all', list);

// rating
router.put('/product/star/:product_id', authCheck, productRating);

module.exports = router;
