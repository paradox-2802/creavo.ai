import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeObject,
  reviewResume,
} from "../controllers/aiControllers.js";

import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

// Text Generation Routes
aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);

// Image Generation Routes
aiRouter.post("/generate-image", auth, generateImage);

// Image Editing Routes (Multer used for file upload)
aiRouter.post(
  "/remove-image-background",
  auth,
  upload.single("image"),
  removeImageBackground,
);

aiRouter.post(
  "/remove-object",
  auth,
  upload.single("image"),
  removeObject
);

// Document Analysis Routes
aiRouter.post("/review-resume", auth, upload.single("resume"), reviewResume);

export default aiRouter;
