import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPosts, deletePost } from '../services/api';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiEye, FiHeart, FiPlus } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const { data } = await getMyPosts();
      setPosts(data);
    } catch (error) {
      toast.error('Failed to fetch posts');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        setPosts(posts.filter((post) => post._id !== id));
        toast.success('Post deleted');
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <Link to="/create" className="create-btn">
          <FiPlus /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{posts.length}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.filter((p) => p.status === 'published').length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{posts.filter((p) => p.status === 'draft').length}</h3>
          <p>Drafts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.reduce((acc, p) => acc + p.views, 0)}</h3>
          <p>Total Views</p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="posts-table-container">
        <h2>My Posts</h2>
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>You haven't written any posts yet.</p>
            <Link to="/create" className="create-btn">
              Write Your First Post
            </Link>
          </div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <Link to={`/post/${post.slug}`} className="post-title-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <span className="category-tag">{post.category}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${post.status}`}>{post.status}</span>
                  </td>
                  <td>
                    <FiEye /> {post.views}
                  </td>
                  <td>
                    <FiHeart /> {post.likes?.length || 0}
                  </td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <Link to={`/edit/${post._id}`} className="action-edit">
                      <FiEdit />
                    </Link>
                    <button onClick={() => handleDelete(post._id)} className="action-delete">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;