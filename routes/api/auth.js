const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { createOrUpdateUser, currentUser } = require('../../controllers/auth');

// USER ROUTES
router.post('/create-or-update-user', authCheck, createOrUpdateUser);
// post request so that people don't make unnecessary requests. Since get requests are easy to make
router.post('/current-user', authCheck, currentUser);

// ADMIN ROUTES
router.post('/current-admin', authCheck, adminCheck, currentUser);

module.exports = router;
