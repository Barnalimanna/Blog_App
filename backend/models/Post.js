const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    featuredImage: {
      url: {
        type: String,
        default: '',
      },
      public_id: {
        type: String,
        default: '',
      },
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
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
      ],
    },
    tags: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  { timestamps: true }
);

postSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = `${this.slug}-${Date.now()}`;
  }

  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
});

module.exports = mongoose.model('Post', postSchema);