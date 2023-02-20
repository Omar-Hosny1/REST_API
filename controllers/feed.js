const path = require("path");
const fs = require("fs");
const Post = require("../models/post");
// sending a status code is a must and that's because we want to inform the client about any error happens;
/*
status code {
  200 : 'Success',
  201 : 'Success a resourse is a successfully created',
  300 : 'Redirection Happend',
  400 : 'Error Happend in client side',
  401 : 'Not Authenticated',
  403 : 'Not Autherized => authenticated but u don't have the right to do this operation',
  404 : 'Not Found',
  422 : 'Error Happend (Vaidating)',
  500 : 'Server Side Error Happend'
}
*/
const { validationResult } = require("express-validator/check");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched Posts Successfully",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  // if (!req.file) {
  //   const error = new Error("No image provided");
  //   error.statusCode = 422;
  //   throw error;
  // }
  // const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    creator: { name: "Omar" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post Created Successfully",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; // will through to the catch
      }
      res.status(200).json({ message: "Post Fetched", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  // if (!imageUrl) {
  //   const error = new Error("No File Picked");
  //   error.statusCode = 422;
  //   throw error;
  // }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; // will through to the catch
      }
      // if (imageUrl !== post.imageUrl) {
      //   // clearImage(post.imageUrl);
      // }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post Updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      // check logged in user
      if (!post) {
        const error = new Error("No Posts Found");
        error.statusCode = 404;
        throw error;
      }
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Posted Deleted Successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
