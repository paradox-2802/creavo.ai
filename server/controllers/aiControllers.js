import { InferenceClient } from "@huggingface/inference";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Hugging Face Inference Client
const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

/**
 * Generates an article based on a prompt.
 * Uses Meta Llama 3.2 1B (Lightweight) for text generation.
 */
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Check usage limits for non-premium users
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Call Hugging Face API for text generation
    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "user",
          content: `Generate an article about ${prompt}. Length: approximately ${length} words.`,
        },
      ],
      max_tokens: parseInt(length) || 500,
    });

    const content = response.choices[0].message.content;

    // Save creation to database
    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    // Update free usage count if applicable
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Generate Article Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Generates SEO-friendly blog titles based on a prompt and category.
 */
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, category } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Check usage limits for non-premium users
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Call Hugging Face API for text generation
    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "user",
          content: `Generate a blog title for the category "${category}" based on: ${prompt}`,
        },
      ],
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;

    // Save creation to database
    await sql`INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    // Update free usage count if applicable
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Generate Blog Title Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Generates an image based on a prompt and style.
 * Uses FLUX.1-schnell (Fastest available distilled model).
 */
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, style, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription.",
      });
    }

    // Call Hugging Face API for image generation
    const imageBlob = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: `Generate a ${style} style image of ${prompt}`,
      parameters: {
        height: 1024,
        width: 1024,
      },
    });

    // Convert Blob to Base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish) 
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Generate Image Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Removes the background from an uploaded image.
 */
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription.",
      });
    }

    // Use Cloudinary's background removal transformation
    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Remove the background of the image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Remove Background Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Removes a specific object from an uploaded image.
 */
export const removeObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription.",
      });
    }

    if (!req.file) {
      return res.json({ success: false, message: "No image uploaded." });
    }

    // Upload original image to Cloudinary
    const { public_id } = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "object-removal",
    });

    // Apply generative remove transformation
    const transformedUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    // Re-upload transformed image to get a persistent URL
    const { secure_url } = await cloudinary.uploader.upload(transformedUrl, {
      resource_type: "image",
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${`Remove the ${object} from the image`}, ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Remove Object Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Reviews an uploaded resume PDF.
 */
export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // Parse PDF content
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `You are a professional resume reviewer. Analyze the following resume for structure, clarity, formatting, and content. Identify any grammatical issues, inconsistencies, or weak language. Suggest improvements. Resume content: ${pdfData.text}`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Review Resume Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
