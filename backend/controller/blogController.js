import Joi from "joi";
import fs from "fs";
import Blog from "../models/blog.js";
import { BACKEND_SERVER_PATH } from "../config/index.js";
import BlogDTO from "../DTO/blogDto.js";
import BlogDetailedDTO from "../DTO/blog-detailedDTO.js";

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  //create blog
  async createBlog(req, res, next) {
    //validate user input using joi
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      photopath: Joi.string().required(),
      author: Joi.string().regex(mongoIdPattern).required(),
    });
    //validate createBlogSchema
    const { error } = createBlogSchema.validate(req.body);
    //if error occurs middleWare will handle it
    if (error) {
      return next(error);
    }
    const { title, content, photopath, author } = req.body;
    //Handle photo
    //read photo in buffer
    const buffer = Buffer.from(
      photopath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );
    //Allot random name
    const imagePath = `${Date.now()}-${author}.png`;
    //save locally
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    //save in database
    let blog;
    try {
      const blogToCrate = new Blog({
        title,
        content,
        author,
        photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });
      blog = await blogToCrate.save();
    } catch (error) {
      return next(error);
    }
    //sending response
    const blogDto = new BlogDTO(blog);
    res.status(201).json({ blog: blogDto });
  },

  //get All blogs method
  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});
      const blogDTO = [];
      for (let i = 0; i < blogs.length; i++) {
        const dto = blogs[i];
        blogDTO.push(dto);
      }
      return res.status(200).json(blogDTO);
    } catch (error) {
      return next(error);
    }
  },
  //getBlogById
  async getBlogById(req, res, next) {
    const getBlogByIdSchema = Joi.object({
      id: Joi.string().required(),
    });
    //validate Schema
    const { error } = getBlogByIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const { id } = req.params;
    let blog;
    //fetch blog by id from database
    try {
      blog = await Blog.findOne({ _id: id }).populate("author");
      if (!blog) {
        const error = {
          status: 404,
          message: "Blog is not Found!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //sending response
    const blogDto = new BlogDetailedDTO(blog);
    res.status(200).json({ blog: blogDto });
  },
  //update blog method
  async updateBlog(req, res, next) {
    //validate user input using joi
    const updateBlogSchema = Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      author: Joi.string().regex(mongoIdPattern).required(),
      blogId: Joi.string().regex(mongoIdPattern).required(),
      photopath: Joi.string(),
    });
    const { error } = updateBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { title, content, author, blogId, photo } = req.body;
    //fetch blog which we want to update by it's blogId
    let blog;
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }
    //delete previous photo
    if (photo) {
      try {
        let previousPhoto = blog.photopath;

        previousPhoto = previousPhoto.split("/").at(-1);
        fs.unlinkSync(`storage/${previousPhoto}`);
      } catch (error) {
        return next(error);
      }
      //save new photo
      //read photo in buffer
      const buffer = Buffer.from(
        photopath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      //Allot random name
      const imagePath = `${Date.now()}-${author}.png`;
      //save locally
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }
      //update blog in database
      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { title, content });
    }
    //sending response
    res.status(200).json({ message: "blog Updated!!" });
  },

  //delete blog method
  async deleteBlog(req, res, next) {
    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongoIdPattern).required(),
    });
    //validate deleteBlogSchema
    const { error } = deleteBlogSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const { id } = req.params;
    //delete blog
    try {
      await Blog.deleteOne({ _id: id });
    } catch (error) {
      return next(error);
    }
    //send response
    res.status(200).json({ message: "Blog deleted!!" });
  },
};

export default blogController;
