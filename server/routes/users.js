const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username email profilePicture');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFriend = user.friends.some(friend => friend._id.toString() === req.user._id.toString());
    const hasPendingRequest = user.friendRequests.some(
      request => request.from.toString() === req.user._id.toString()
    );
    const hasReceivedRequest = req.user.friendRequests.some(
      request => request.from.toString() === user._id.toString()
    );

    res.json({
      user,
      relationship: {
        isFriend,
        hasPendingRequest,
        hasReceivedRequest,
        isOwn: user._id.toString() === req.user._id.toString()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { bio, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bio, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/:id/friends
// @desc    Send/Accept friend request
// @access  Private
router.post('/:id/friends', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'You cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({ error: 'You are already friends' });
    }

    // Check if there's a pending request from target user (accept request)
    const pendingRequestIndex = currentUser.friendRequests.findIndex(
      request => request.from.toString() === targetUserId
    );

    if (pendingRequestIndex !== -1) {
      // Accept friend request
      currentUser.friends.push(targetUserId);
      targetUser.friends.push(currentUserId);
      
      // Remove friend request
      currentUser.friendRequests.splice(pendingRequestIndex, 1);
      
      // Remove from sent requests
      const sentRequestIndex = targetUser.sentFriendRequests.findIndex(
        request => request.to.toString() === currentUserId
      );
      if (sentRequestIndex !== -1) {
        targetUser.sentFriendRequests.splice(sentRequestIndex, 1);
      }

      await currentUser.save();
      await targetUser.save();

      return res.json({ message: 'Friend request accepted' });
    }

    // Check if request already sent
    const alreadySent = currentUser.sentFriendRequests.some(
      request => request.to.toString() === targetUserId
    );

    if (alreadySent) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Send friend request
    targetUser.friendRequests.push({ from: currentUserId });
    currentUser.sentFriendRequests.push({ to: targetUserId });

    await targetUser.save();
    await currentUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/friends
// @desc    Get user's friends
// @access  Private
router.get('/:id/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends', 'username email profilePicture bio')
      .select('friends');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/search/:query
// @desc    Search users
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email profilePicture bio')
    .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/me/friend-requests
// @desc    Get pending friend requests
// @access  Private
router.get('/me/friend-requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'username email profilePicture')
      .select('friendRequests');

    res.json({ friendRequests: user.friendRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
