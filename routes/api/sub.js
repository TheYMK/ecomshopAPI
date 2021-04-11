const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, read, list, update, remove } = require('../../controllers/sub');

// routes

router.post('/sub', authCheck, adminCheck, create);
router.get('/sub/:slug', read);
router.get('/subs', list); // this one is public
router.put('/sub/:slug', authCheck, adminCheck, update);
router.delete('/sub/:slug', authCheck, adminCheck, remove);

module.exports = router;
