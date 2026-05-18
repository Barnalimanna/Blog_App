import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updatePost } from '../services/api';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import normalizeEditorLinks from '../utils/normalizeEditorLinks';
import 'react-quill-new/dist/quill.snow.css';
import './CreatePost.css';
import API from '../services/api';

const CATEGORIES = [
  'Technology',
  'Health',
  'Travel',
  'Food',
  'Lifestyle',
  'Business',
  'Environment',
  'Games',
  'Mythology',
  'Astrology',
  'Other',
];

const EXCERPT_LIMIT = 500;
const CONTENT_LIMIT = 10000;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'code-block'],
    ['clean'],
  ],
};

const EditPost = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    status: 'draft',
    excerpt: '',
  });

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  const getPlainText = (html) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await API.get(`/posts/id/${id}`);

        setFormData({
          title: data.title || '',
          category: data.category || '',
          tags: data.tags?.join(', ') || '',
          status: data.status || 'draft',
          excerpt: data.excerpt || '',
        });

        setContent(data.content || '');

        if (data.featuredImage) {
          if (typeof data.featuredImage === 'string') {
            if (data.featuredImage !== 'default-post.jpg') {
              setPreview(data.featuredImage);
            }
          } else if (data.featuredImage.url) {
            setPreview(data.featuredImage.url);
          }
        }
      } catch (error) {
        toast.error('Failed to fetch post');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'excerpt' && value.length > EXCERPT_LIMIT) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : preview);
  };

  const handleSubmit = async (postStatus) => {
    const plainText = getPlainText(content);

    if (!plainText) {
      toast.error('Please add content');
      return;
    }

    if (plainText.length > CONTENT_LIMIT) {
      toast.error(`Content cannot exceed ${CONTENT_LIMIT} characters`);
      return;
    }

    if (formData.excerpt.length > EXCERPT_LIMIT) {
      toast.error(`Excerpt cannot exceed ${EXCERPT_LIMIT} characters`);
      return;
    }

    if (formData.title.trim().length < 5 || formData.title.trim().length > 200) {
      toast.error('Title must be 5-200 characters');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      const normalizedContent = normalizeEditorLinks(content);
      data.append('title', formData.title.trim());
      data.append('content', normalizedContent);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      data.append('status', postStatus);
      data.append('excerpt', formData.excerpt.trim());

      if (image) {
        data.append('featuredImage', image);
      }

      await updatePost(id, data);

      toast.success(
        postStatus === 'draft'
          ? 'Draft updated successfully!'
          : 'Post updated successfully!'
      );

      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Loading post...</div>;

  return (
    <div className="create-post-page container">
      <h1>Edit Post</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(formData.status);
        }}
        className="post-form"
      >
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="react, javascript, web development"
          />
        </div>

        <div className="form-group">
          <label>Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description"
            rows="3"
            maxLength={EXCERPT_LIMIT}
          />
          <small>
            {formData.excerpt.length}/{EXCERPT_LIMIT}
          </small>
        </div>

        <div className="form-group">
          <label>Featured Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Content *</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={(value) => {
              const plainText = getPlainText(value);

              if (plainText.length <= CONTENT_LIMIT) {
                setContent(value);
              } else {
                toast.error(`Content cannot exceed ${CONTENT_LIMIT} characters`);
              }
            }}
            modules={modules}
            className="quill-editor"
          />
          <small>
            {getPlainText(content).length}/{CONTENT_LIMIT}
          </small>
        </div>

        <div
          style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
        >
          <button
            type="button"
            className="submit-btn"
            disabled={loading}
            onClick={() => handleSubmit('draft')}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            className="submit-btn"
            disabled={loading}
            onClick={() => handleSubmit('published')}
          >
            {loading ? 'Updating...' : 'Publish Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;