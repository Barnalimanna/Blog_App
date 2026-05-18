const Comment = require('../models/Comment');
const axios = require('axios');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'username avatar')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const createComment = async (req, res) => {
//   try {
//     const { content, parentComment } = req.body;

//     //send comment to fastapi

//     const mlResponse = await axios.post(
//       'http://127.0.0.1:8000/predict',
//       {
//         text:content,
//       }
//     );

//     console.log("ML RESPONSE:", mlResponse.data);

//     //block bully comment

//     if(prediction == 'bully'){
//       return res.status(400).json({
//         message: 'Cyberbullting comment detected',
//       });
//     }

//     //save safe comment

//     const comment = await Comment.create({
//       content,
//       post: req.params.postId,
//       user: req.user._id,
//       parentComment: parentComment || null,
//     });

//     const populatedComment = await comment.populate('user', 'username avatar');
//     res.status(201).json(populatedComment);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    // Send comment to FastAPI
    const mlResponse = await axios.post(
      'http://127.0.0.1:8000/predict',
      {
        comment: content,
      }
    );

    console.log("ML RESPONSE:", mlResponse.data);

    // Get prediction
    const prediction = mlResponse.data.prediction;

    // Block bully comment
    if (prediction === 1) {
      return res.status(400).json({
        message: 'Cyberbullying comment detected',
      });
    }

    // Save safe comment
    const comment = await Comment.create({
      content,
      post: req.params.postId,
      user: req.user._id,
      parentComment: parentComment || null,
    });

    const populatedComment = await comment.populate(
      'user',
      'username avatar'
    );

    res.status(201).json(populatedComment);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment };






