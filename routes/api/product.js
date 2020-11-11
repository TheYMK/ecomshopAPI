const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, listAll, remove, read, getAllProducts, update } = require('../../controllers/product');

// routes

router.post('/product', authCheck, adminCheck, create);
router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/product/:slug', read);
router.get('/products', getAllProducts);
router.put('/product/:slug', authCheck, adminCheck, update);
module.exports = router;
