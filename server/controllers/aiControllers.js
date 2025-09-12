import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const a4fClient = new OpenAI({
  apiKey: process.env.A4F_API_KEY,
  baseURL: "https://api.a4f.co/v1",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // const response = await openai.chat.completions.create({
    //   model: "gemini-2.0-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: `Generate an article about ${prompt}`,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: length,
    // });

    const response = await a4fClient.chat.completions.create({
      model: "provider-3/gpt-4.1-nano",
      messages: [
        { role: "user", content: `Generate an article about ${prompt}` },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, category } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // const response = await openai.chat.completions.create({
    //   model: "gemini-2.0-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: `Generate a blog title for the category "${category}" based on: ${prompt}`,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 200,
    // });

    
    const response = await a4fClient.chat.completions.create({
      model: "provider-3/gpt-4.1-nano",
      messages: [
        {
          role: "user",
          content: `Suggest some relevant blog title for the category "${category}" based on the topic : ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

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

    // const formData = new FormData();
    // formData.append("prompt", `Generate a ${style} style image of ${prompt}`);

    // const { data } = await axios.post(
    //   "https://clipdrop-api.co/text-to-image/v1",
    //   formData,
    //   {
    //     headers: {
    //       "x-api-key": process.env.CLIPDROP_API_KEY,
    //     },
    //     responseType: "arraybuffer",
    //   }
    // );

    // const base64Image = `data:image/png;base64,${Buffer.from(
    //   data,
    //   "binary"
    // ).toString("base64")}`;

    // const { secure_url } = await cloudinary.uploader.upload(base64Image);

    const response = await a4fClient.images.generate({
      model: "provider-4/imagen-4",
      prompt: `Generate a ${style} style image of ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64Image = `data:image/png;base64,${response.data[0].b64_json}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish) 
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

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

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Remove the background of the image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription.",
      });
    }

    const stream = fs.createReadStream(image.path);

    const response = await a4fClient.images.edit({
      model: "provider-6/black-forest-labs-flux-1-kontext-max",
      image: stream,
      prompt: `Remove the ${object} from the image`,
      response_format: "b64_json",
    });

    const base64Image = `data:image/png;base64,${response.data[0].b64_json}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
    INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${`Remove the ${object} from the image`}, ${secure_url}, 'image')
`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


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

    
   const dataBuffer = fs.readFileSync(resume.path);
   const pdfData = await pdf(dataBuffer);


    const prompt = `You are a professional resume reviewer. Analyze the following resume for structure, clarity, formatting, and content. Identify any grammatical issues, inconsistencies, or weak language. Suggest improvements. Resume content: ${pdfData.text}`;

    const response = await a4fClient.chat.completions.create({
      model: "provider-3/gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
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
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
