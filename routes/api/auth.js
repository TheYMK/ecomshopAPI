const express = require('express');
const router = express.Router();

// middlewares
const { authCheck } = require('../../middlewares/auth');
// controllers
const { createOrUpdateUser, currentUser } = require('../../controllers/auth');

router.post('/create-or-update-user', authCheck, createOrUpdateUser);

// post request so that people don't make unnecessary requests. Since get requests are easy to make
router.post('/current-user', authCheck, currentUser);

module.exports = router;
