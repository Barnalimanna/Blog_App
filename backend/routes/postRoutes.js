const express = require('express');
const router = express.Router();

const {
  getPosts,
  getPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getMyPosts,
  removeFeaturedImage,
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');

router.get('/', getPosts);
router.get('/user/me', protect, getMyPosts);
router.get('/id/:id', protect, getPostById);
router.get('/:slug', optionalAuth, getPost);

router.post('/', protect, upload.single('featuredImage'), createPost);
router.put('/:id', protect, upload.single('featuredImage'), updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.delete('/:id/image', protect, removeFeaturedImage);

module.exports = router;