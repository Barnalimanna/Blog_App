import { useState, useEffect } from 'react';
import { getPosts } from '../services/api';
import PostCard from '../components/PostCard';
import { FiSearch } from 'react-icons/fi';
import './Home.css';

const CATEGORIES = ['All', 'Technology', 'Health', 'Travel', 'Food', 'Lifestyle', 'Business','Environment','Games','Mythology','Astrology', 'Other'];

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [page, category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;

      const { data } = await getPosts(params);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to PostNest</h1>
        <p>Discover stories, thinking, and expertise from writers on any topic</p>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <FiSearch />
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="categories-section container">
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${category === cat || (!category && cat === 'All') ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat === 'All' ? '' : cat);
                setPage(1);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="posts-section container">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">No posts found</div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;