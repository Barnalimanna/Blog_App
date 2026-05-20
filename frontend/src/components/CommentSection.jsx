import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComments, createComment, deleteComment } from '../services/api';
import { toast } from 'react-toastify';
import { FiTrash2, FiCornerDownRight } from 'react-icons/fi';
import './CommentSection.css';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setCommentError('');

    try {
      await createComment(postId, { content });
      setContent('');
      fetchComments();
      toast.success('Comment added!');
    } catch (error) {
      const msg = error.response?.data?.mesage || 'Inappropriate comment is prohabitade';

      setCommentError(msg);
      // toast.error(msg);
    }
    setLoading(false);
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await createComment(postId, { content: replyContent, parentComment: parentId });
      setReplyContent('');
      setReplyTo(null);
      fetchComments();
      toast.success('Reply added!');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(id);
        fetchComments();
        toast.success('Comment deleted');
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>

      {user ? (
        <>
         <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
           {commentError &&(
          <div className="comment-error">
            {commentError}
          </div>
          )}
        </>
      ) : (
        <p className="login-prompt">Please login to comment</p>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <strong>{comment.user?.username}</strong>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p>{comment.content}</p>
            <div className="comment-actions">
              {user && (
                <button onClick={() => setReplyTo(comment._id)} className="reply-btn">
                  <FiCornerDownRight /> Reply
                </button>
              )}
              {user && (user._id === comment.user?._id || user.role === 'admin') && (
                <button onClick={() => handleDelete(comment._id)} className="delete-btn">
                  <FiTrash2 /> Delete
                </button>
              )}
            </div>

            {/* Reply form */}
            {replyTo === comment._id && (
              <form onSubmit={(e) => handleReply(e, comment._id)} className="reply-form">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows="2"
                  required
                />
                <div>
                  <button type="submit">Reply</button>
                  <button type="button" onClick={() => setReplyTo(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies?.map((reply) => (
              <div key={reply._id} className="reply">
                <div className="comment-header">
                  <strong>{reply.user?.username}</strong>
                  <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <p>{reply.content}</p>
                {user && (user._id === reply.user?._id || user.role === 'admin') && (
                  <button onClick={() => handleDelete(reply._id)} className="delete-btn">
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;