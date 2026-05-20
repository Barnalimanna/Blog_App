import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token,password) => API.put(`/auth/reset-password/${token}`, { password });
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

export const getPosts = (params) => API.get('/posts', { params });
export const getPost = (slug) => API.get(`/posts/${slug}`);
export const createPost = (data) => API.post('/posts', data);
export const updatePost = (id, data) => API.put(`/posts/${id}`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const getMyPosts = () => API.get('/posts/user/me');

export const getComments = (postId) => API.get(`/comments/${postId}`);
export const createComment = (postId, data) => API.post(`/comments/${postId}`, data);
export const deleteComment = (id) => API.delete(`/comments/${id}`);

export default API;