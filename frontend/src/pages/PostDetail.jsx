import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, likePost, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { toast } from 'react-toastify';
import normalizeEditorLinks from '../utils/normalizeEditorLinks';
import {
  FiHeart,
  FiEye,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiTag,
} from 'react-icons/fi';
import DOMPurify from 'dompurify';
import { getFeaturedImageUrl } from '../utils/getFeaturedImageUrl';
import './PostDetail.css';
import { Helmet } from 'react-helmet-async';

const PostDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const articleRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
  if (post?.title) {
    document.title = `${post.title} | PostNest`;
  }
}, [post]);

  useEffect(() => {
    if (articleRef.current) {
      const links = articleRef.current.querySelectorAll('a');
      links.forEach((link) => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const { data } = await getPost(slug);
      setPost(data);
      setLikesCount(data.likes?.length || 0);
      setLiked(user ? data.likes?.includes(user._id) : false);
    } catch (error) {
      toast.error('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const { data } = await likePost(post._id);
      setLikesCount(data.likes.length);
      setLiked(data.likes.includes(user._id));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        toast.success('Post deleted');
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (!post) return <div className="loading">Post not found</div>;

  return (
    <>
      <Helmet>
        <title>{post.title} | PostNest</title>

        <meta
             name="description"
             content={post.excerpt || post.content?.slice(0,150)}
        />

        <meta
             name="keywords"
             content={Array.isArray(post.tags) ? post.tags.join(', ') : ''}
        />
      </Helmet>
      <div className="post-detail">
        <div className="post-detail-hero">
          <img
            src={getFeaturedImageUrl(
            post.featuredImage,
            'https://via.placeholder.com/1200x500'
          )}
          alt={post.title}
          />
        <div className="post-detail-hero-overlay">
          <span className="category-badge">{post.category}</span>
          <h1>{post.title}</h1>

          <div className="post-detail-meta">
            <span>
              <FiCalendar />{' '}
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>
              <FiEye /> {post.views} views
            </span>
            <span>
              <FiHeart /> {likesCount} likes
            </span>
          </div>
        </div>
      </div>

      <div className="post-detail-content container">
        <div className="post-detail-topbar">
          <div className="author-card">
            <div className="author-details">
              <strong>{post.author?.username}</strong>
              {post.author?.bio && <p>{post.author.bio}</p>}
            </div>
          </div>

          <div className="post-actions">
            <button
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <FiHeart /> {liked ? 'Liked' : 'Like'}
            </button>

            {user && (user._id === post.author?._id || user.role === 'admin') && (
              <>
                <Link to={`/edit/${post._id}`} className="edit-btn">
                  <FiEdit /> Edit
                </Link>
                <button onClick={handleDelete} className="delete-btn-action">
                  <FiTrash2 /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                <FiTag /> {tag}
              </span>
            ))}
          </div>
        )}

        <article
          ref={articleRef}
          className="post-article"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(normalizeEditorLinks(post.content)),
          }}
        />

        <CommentSection postId={post._id} />
        </div>
      </div>
    </>
  );
};

export default PostDetail;