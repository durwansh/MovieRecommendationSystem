const express = require('express');
const router = express.Router();
const {
  addMovie,
  updateMovie,
  deleteMovie,
  getUsers,
  deleteUser,
  getSystemStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, admin);

router.post('/movies', addMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/stats', getSystemStats);

module.exports = router;
