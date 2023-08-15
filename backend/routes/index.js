import express from "express";
import authController from "../controller/authController.js";
import auth from "../middleWare/auth.js";
import blogController from "../controller/blogController.js";

const router = express.Router();
//AuthController endPoints
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.get("/refresh", authController.refresh);

//blogController endPoints
router.post("/blog", auth, blogController.createBlog);
router.get("/blog/all", auth, blogController.getAll);
router.get("/blog/:id", auth, blogController.getBlogById);
router.put("/blog", auth, blogController.updateBlog);
router.delete("/blog/delete/:id", auth, blogController.deleteBlog);

export default router;
