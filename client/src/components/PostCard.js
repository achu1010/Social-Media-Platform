import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const isOwner = post.userId._id === user.id;
  const isLiked = post.likes.includes(user.id);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleLike = async () => {
    try {
      setLoadingLike(true);
      const response = await postAPI.likePost(post._id);
      
      const updatedPost = {
        ...post,
        likes: isLiked 
          ? post.likes.filter(id => id !== user.id)
          : [...post.likes, user.id]
      };
      
      onPostUpdated(updatedPost);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoadingDelete(true);
      await postAPI.deletePost(post._id);
      onPostDeleted(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    try {
      setLoadingComment(true);
      const response = await postAPI.addComment(post._id, { text: commentText.trim() });
      
      const updatedPost = {
        ...post,
        comments: [...post.comments, response.data.comment]
      };
      
      onPostUpdated(updatedPost);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="card">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.userId._id}`} className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
              {post.userId.profilePicture ? (
                <img
                  src={post.userId.profilePicture}
                  alt={post.userId.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {post.userId?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </Link>
          <div>
            <Link 
              to={`/profile/${post.userId._id}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {post.userId?.username || 'Unknown User'}
            </Link>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
          >
            {loadingDelete ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.text}</p>
        {post.image && (
          <div className="mt-3">
            <img
              src={post.image}
              alt="Post content"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between py-2 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
            }`}
          >
            <svg
              className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm">{post.comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={loadingComment || !commentText.trim()}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    loadingComment || !commentText.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {loadingComment ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <Link to={`/profile/${comment.userId._id}`} className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                    {comment.userId.profilePicture ? (
                      <img
                        src={comment.userId.profilePicture}
                        alt={comment.userId.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <Link 
                      to={`/profile/${comment.userId._id}`}
                      className="font-medium text-sm text-gray-900 hover:text-primary-600"
                    >
                      {comment.userId?.username || 'Unknown User'}
                    </Link>
                    <p className="text-sm text-gray-800">{comment.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-3">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
