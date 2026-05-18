const Post = require('../models/Post');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinaryHelper');

const ALLOWED_STATUSES = ['draft', 'published'];

const isOwnerOrAdmin = (user, post) => {
  if (!user) return false;

  const authorId = post.author?._id
    ? post.author._id.toString()
    : post.author.toString();

  return authorId === user._id.toString() || user.role === 'admin';
};

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { status: 'published' };

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      'author',
      'username avatar bio'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Draft visible only to owner/admin
    if (post.status !== 'published' && !isOwnerOrAdmin(req.user, post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only count views for published posts
    if (post.status === 'published') {
      post.views += 1;
      await post.save();
    }

    res.json(post);
  } catch (error) {
    console.error('getPost error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username avatar'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Draft visible only to owner/admin
    if (post.status !== 'published' && !isOwnerOrAdmin(req.user, post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('getPostById error:', error);
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, status, excerpt } = req.body;

    let featuredImage = {
      url: '',
      public_id: '',
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blog-posts');

      featuredImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

const safeStatus = ['draft', 'published'].includes(status)
  ? status
  : 'draft';
    const post = await Post.create({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      status: safeStatus,
      excerpt,
      author: req.user._id,
      featuredImage,
    });

    const populatedPost = await post.populate('author', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category, tags, status, excerpt } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (excerpt !== undefined) post.excerpt = excerpt;

    if (tags !== undefined) {
      post.tags = tags ? tags.split(',').map((tag) => tag.trim()) : [];
    }

    if (status !== undefined && ALLOWED_STATUSES.includes(status)) {
      post.status = status;
    }

    if (req.file) {
      if (post.featuredImage && post.featuredImage.public_id) {
        await deleteFromCloudinary(post.featuredImage.public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer, 'blog-posts');

      post.featuredImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const updatedPost = await post.save();
    const populatedPost = await updatedPost.populate('author', 'username avatar');

    res.json(populatedPost);
  } catch (error) {
    console.error('updatePost error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (post.featuredImage && post.featuredImage.public_id) {
      await deleteFromCloudinary(post.featuredImage.public_id);
    }

    await post.deleteOne();

    res.json({ message: 'Post and image removed successfully' });
  } catch (error) {
    console.error('deletePost error:', error);
    res.status(500).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Prevent likes on drafts unless you want otherwise
    if (post.status !== 'published') {
      return res.status(403).json({ message: 'Cannot like a draft post' });
    }

    const index = post.likes.findIndex(
      (id) => id.toString() === req.user._id.toString()
    );

    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('likePost error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('getMyPosts error:', error);
    res.status(500).json({ message: error.message });
  }
};

const removeFeaturedImage = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (post.featuredImage && post.featuredImage.public_id) {
      await deleteFromCloudinary(post.featuredImage.public_id);
      post.featuredImage = { url: '', public_id: '' };
      await post.save();
    }

    res.json({ message: 'Featured image removed successfully', post });
  } catch (error) {
    console.error('removeFeaturedImage error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getMyPosts,
  removeFeaturedImage,
};