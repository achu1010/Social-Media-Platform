const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Post text is required' });
    }

    const post = new Post({
      userId: req.user._id,
      text: text.trim(),
      image: image || ''
    });

    await post.save();
    await post.populate('userId', 'username profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feed for user
router.get('/feed/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verify user exists and get their friends
    const user = await User.findById(userId).select('friends');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get posts from user and their friends
    const feedUserIds = [userId, ...user.friends];
    
    const posts = await Post.find({ userId: { $in: feedUserIds } })
      .populate('userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/posts/user/:id
// @desc    Get posts by specific user
// @access  Private
router.get('/user/:id', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate('userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
      await post.save();
      res.json({ message: 'Post liked', liked: true, likesCount: post.likes.length });
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ message: 'Post unliked', liked: false, likesCount: post.likes.length });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      userId: req.user._id,
      text: text.trim()
    };

    post.comments.push(newComment);
    await post.save();
    
    // Populate the new comment
    await post.populate('comments.userId', 'username profilePicture');
    
    const addedComment = post.comments[post.comments.length - 1];
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
