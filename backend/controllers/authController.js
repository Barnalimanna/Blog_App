const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinaryHelper');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username =
      req.body.username !== undefined ? req.body.username : user.username;

    user.email =
      req.body.email !== undefined ? req.body.email : user.email;

    user.bio =
      req.body.bio !== undefined ? req.body.bio : user.bio;

    if (req.file) {
      if (user.avatar && user.avatar.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer, 'avatars');

      user.avatar = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};