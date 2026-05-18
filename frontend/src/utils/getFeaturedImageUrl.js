export const getFeaturedImageUrl = (
  featuredImage,
  fallback = 'https://via.placeholder.com/400x250'
) => {
  if (!featuredImage) return fallback;

  if (typeof featuredImage === 'string') {
    return featuredImage !== 'default-post.jpg' ? featuredImage : fallback;
  }

  return featuredImage.url || fallback;
};