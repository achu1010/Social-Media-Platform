import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const FriendsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getFriends(user.id);
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getFriendRequests();
      setFriendRequests(response.data.friendRequests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchFriendRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === 'search') {
        searchUsers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab]);

  const handleSendFriendRequest = async (userId) => {
    try {
      await userAPI.sendFriendRequest(userId);
      // Remove from search results or update status
      setSearchResults(prev => prev.filter(user => user._id !== userId));
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (userId) => {
    try {
      await userAPI.sendFriendRequest(userId);
      // Refresh friend requests and friends list
      fetchFriendRequests();
      if (activeTab === 'friends') {
        fetchFriends();
      }
      alert('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    }
  };

  const UserCard = ({ user: userData, showActions = false, isRequest = false }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Link to={`/profile/${userData._id}`} className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt={userData.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-medium">
                {userData.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>
        <div>
          <Link 
            to={`/profile/${userData._id}`}
            className="font-medium text-gray-900 hover:text-primary-600"
          >
            {userData.username || 'Unknown User'}
          </Link>
          <p className="text-sm text-gray-600">{userData.email || 'No email'}</p>
          {userData.bio && (
            <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">{userData.bio}</p>
          )}
        </div>
      </div>
      
      {showActions && (
        <button
          onClick={() => handleSendFriendRequest(userData._id)}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Add Friend
        </button>
      )}
      
      {isRequest && (
        <button
          onClick={() => handleAcceptFriendRequest(userData.from._id)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Accept
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600 mt-2">Manage your friends and discover new connections</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('friends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'friends'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Friend Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Find Friends
          </button>
        </nav>
      </div>

      {/* Search Bar (only for search tab) */}
      {activeTab === 'search' && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for friends by username or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <>
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No friends yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start connecting with people by searching for friends.
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="mt-4 btn-primary"
                    >
                      Find Friends
                    </button>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <UserCard key={friend._id} user={friend} />
                  ))
                )}
              </>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {friendRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No friend requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any pending friend requests.
                    </p>
                  </div>
                ) : (
                  friendRequests.map((request) => (
                    <UserCard key={request._id} user={request} isRequest={true} />
                  ))
                )}
              </>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <>
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : searchQuery && searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try searching with a different username or email.
                    </p>
                  </div>
                ) : !searchQuery ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Search for friends</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter a username or email to find people you might know.
                    </p>
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <UserCard key={user._id} user={user} showActions={true} />
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
