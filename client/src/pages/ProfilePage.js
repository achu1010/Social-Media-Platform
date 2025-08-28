import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import PostCard from '../components/PostCard';
import ImageUploader from '../components/ImageUploader';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    profilePicture: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);

  const isOwnProfile = userId === currentUser?.id;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(userId);
      setProfile(response.data.user);
      setRelationship(response.data.relationship);
      setEditForm({
        bio: response.data.user.bio || '',
        profilePicture: response.data.user.profilePicture || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await postAPI.getUserPosts(userId);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
    }
  }, [userId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(userId, editForm);
      setProfile(response.data.user);
      if (isOwnProfile) {
        updateUser(response.data.user);
      }
      setEditing(false);
      setProfileImageFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleProfileImageSelect = (imageUrl, file) => {
    setEditForm(prev => ({
      ...prev,
      profilePicture: imageUrl // Use the server URL
    }));
    setProfileImageFile(file);
  };

  const handleFriendAction = async () => {
    try {
      await userAPI.sendFriendRequest(userId);
      // Refresh profile to get updated relationship status
      fetchProfile();
    } catch (error) {
      console.error('Error with friend action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="mx-auto h-32 w-32 rounded-full bg-primary-500 flex items-center justify-center mb-4">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.username}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.username}</h1>
              <p className="text-gray-600">{profile?.email}</p>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bio</h3>
              {editing && isOwnProfile ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {editForm.bio.length}/500
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <ImageUploader
                      onImageSelect={handleProfileImageSelect}
                      currentImage={editForm.profilePicture}
                      placeholder="Click to upload profile picture"
                      previewClassName="w-32 h-32 rounded-full"
                      className="flex justify-center"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-700 mb-4">
                    {profile?.bio || 'No bio available'}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-secondary w-full"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Friend Status */}
            {!isOwnProfile && relationship && (
              <div className="mb-6">
                {relationship.isFriend ? (
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Friends
                    </div>
                  </div>
                ) : relationship.hasPendingRequest ? (
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                      Request Sent
                    </div>
                  </div>
                ) : relationship.hasReceivedRequest ? (
                  <button
                    onClick={handleFriendAction}
                    className="w-full btn-primary"
                  >
                    Accept Friend Request
                  </button>
                ) : (
                  <button
                    onClick={handleFriendAction}
                    className="w-full btn-primary"
                  >
                    Send Friend Request
                  </button>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-gray-600">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{profile?.friends?.length || 0}</div>
                  <div className="text-gray-600">Friends</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isOwnProfile ? 'Your Posts' : `${profile?.username}'s Posts`}
            </h2>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center">
              <div className="py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isOwnProfile ? 'Share your first post!' : 'This user hasn\'t posted anything yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
