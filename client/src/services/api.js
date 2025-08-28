import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  sendFriendRequest: (userId) => api.post(`/users/${userId}/friends`),
  getFriends: (userId) => api.get(`/users/${userId}/friends`),
  searchUsers: (query) => api.get(`/users/search/${query}`),
  getFriendRequests: () => api.get('/users/me/friend-requests'),
};

// Post APIs
export const postAPI = {
  createPost: (postData) => api.post('/posts', postData),
  getFeed: (userId) => api.get(`/posts/feed/${userId}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, commentData) => api.post(`/posts/${postId}/comment`, commentData),
  getPost: (postId) => api.get(`/posts/${postId}`),
};

// Upload APIs
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
