const express = require('express');
const router = express.Router();
const { searchByHashtag } = require('../controllers/hashtagController');

// Example: /api/hashtags/:tag
router.get('/:tag', searchByHashtag);

module.exports = router;
