import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiCalendar } from 'react-icons/fi';
import { getFeaturedImageUrl } from '../utils/getFeaturedImageUrl';
import './PostCard.css';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <div className="post-card-image">
        <img
          src={getFeaturedImageUrl(
            post.featuredImage,
            'https://via.placeholder.com/400x250'
          )}
          alt={post.title}
        />
        <span className="category-badge">{post.category}</span>
      </div>

      <div className="post-card-content">
        <div className="post-meta">
          <span>
            <FiCalendar /> {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <span>
            <FiEye /> {post.views}
          </span>
          <span>
            <FiHeart /> {post.likes?.length || 0}
          </span>
        </div>

        <Link to={`/post/${post.slug}`}>
          <h2 className="post-card-title">{post.title}</h2>
        </Link>

        <p className="post-card-excerpt">{post.excerpt}</p>

        <div className="post-card-footer">
          <div className="author-info">
            <span>By {post.author?.username}</span>
          </div>
          <Link to={`/post/${post.slug}`} className="read-more">
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;