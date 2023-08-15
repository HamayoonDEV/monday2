class BlogDetailedDTO {
  constructor(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.content = blog.content;
    this.photopath = blog.photopath;
    this.authorUserName = blog.author.username;
    this.authorName = blog.author.name;
    this.createdAt = blog.author.createdAt;
  }
}

export default BlogDetailedDTO;
