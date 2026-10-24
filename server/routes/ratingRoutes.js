const express = require('express');
const router = express.Router();
const { addOrUpdateRating, getUserRatings, deleteRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addOrUpdateRating);
router.get('/my-ratings', protect, getUserRatings);
router.delete('/:id', protect, deleteRating);

module.exports = router;
