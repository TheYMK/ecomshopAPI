const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, read, list, update, remove, getSubs } = require('../../controllers/category');

// routes

router.post('/category', authCheck, adminCheck, create);
router.get('/category/:slug', read);
router.get('/categories', list); // this one is public
router.put('/category/:slug', authCheck, adminCheck, update);
router.delete('/category/:slug', authCheck, adminCheck, remove);
router.get('/category/:_id/subs', getSubs);

module.exports = router;
