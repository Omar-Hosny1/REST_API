// sending a status code is a must and that's because we want to inform the client about any error happens;
/*
status code {
  200 : 'Success',
  201 : 'Success a resourse is a successfully created'
}
*/

exports.getPosts = (req, res, next) => {
  // return a response with a json data
  res.status(200).json({
    posts: [{ title: "First Post", content: "Hey Guys this is my first post" }],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  res.status(201).json({
    message: "Post Created Successfully",
    post: { id: new Date().toISOString(), title, content },
  });
};
