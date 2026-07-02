# Creavo.ai 🧠✨

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.1.0-lightgrey?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<br />

**Creavo.ai** is a comprehensive, all-in-one AI-powered creative and productivity suite built on the **PERN stack** (PostgreSQL, Express, React, Node.js). It empowers users to instantly generate high-quality text content, create and edit images with AI, and analyze resumes using advanced open-weight and proprietary AI models.

With integrated features like tiered subscriptions, community sharing, and interactive dashboards, Creavo.ai is a fully realized SaaS application designed for seamless performance and a premium user experience.

---

## 🚀 Key Features

### ✍️ AI Content Generation
- **Article Generator**: Create full-length, structured articles on any topic. Users can customize the prompt and desired output length.
- **Blog Title Generator**: Generate catchy, SEO-friendly blog titles based on specific keywords and categories.

### 🎨 AI Image Studio
- **Image Generator (Premium)**: Turn text prompts into stunning visual art in seconds.
- **Background Remover (Premium)**: Instantly and accurately remove backgrounds from uploaded images.
- **Object Remover (Premium)**: Clean up images by seamlessly erasing unwanted objects using generative fill technology.

### 💼 Career Tools
- **Resume Analyzer (Premium)**: Upload a PDF resume to receive comprehensive, AI-driven feedback. The system analyzes structure, formatting, and content to provide actionable improvement suggestions.

### 🌐 Community & Dashboard
- **Personal Dashboard**: Users can view and manage their personal history of generated content (text, images, and resume reviews).
- **Community Feed**: A public gallery where users can publish their creations, browse others' work, and toggle "likes" on their favorite posts.
- **Usage Tracking & Tiers**: Non-premium users are granted 10 free credits for basic text generation. Premium users enjoy unlimited access and exclusive image/document tools.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **State & Routing**: React Router DOM v7
- **Data Fetching**: Axios
- **Notifications**: React Hot Toast
- **Markdown Rendering**: React Markdown

### Backend (Server)
- **Runtime & Framework**: Node.js, Express 5.1
- **Database**: PostgreSQL (Serverless via Neon DB `@neondatabase/serverless`)
- **Authentication**: Clerk (`@clerk/express`, `@clerk/clerk-react`)
- **File Uploads & Storage**: Multer (parsing), Cloudinary (storage & transformations)
- **Document Processing**: `pdf-parse` (Extracting text from resumes)

### AI Models & Integrations ⚡
- **Text Generation & Analysis**: `meta-llama/Llama-3.2-1B-Instruct` (via Hugging Face Inference API)
- **Image Generation**: `black-forest-labs/FLUX.1-schnell` (via Hugging Face Inference API)
- **Image Editing (Generative Fill / BG Removal)**: Cloudinary AI Transformations

---

## 🏗️ Architecture & Data Flow

1. **Authentication**: Handled natively by Clerk. The client passes the Clerk session token to the Express backend.
2. **Middleware**: Custom `requireAuth` middleware validates the user. A custom plan middleware checks Clerk's `privateMetadata` for usage counts (`free_usage`) and subscription tiers (`plan`).
3. **AI Processing**: 
   - Text tasks are routed directly to the Hugging Face Inference API.
   - Image generation is routed to Hugging Face, returning a Blob which is converted to base64 and uploaded to Cloudinary for persistent hosting.
   - Image edits (BG/Object removal) utilize Cloudinary's built-in AI effect pipelines.
4. **Database Storage**: Outputs, URLs, and prompts are stored in a Neon PostgreSQL database using raw SQL queries.

### Database Schema (Overview)
**`creations` Table**:
- `id` (Primary Key)
- `user_id` (String - Clerk User ID)
- `prompt` (Text)
- `content` (Text - Generated text or Image URL)
- `type` (String - e.g., 'article', 'image', 'resume-review')
- `publish` (Boolean - Publicly visible in Community)
- `likes` (Text Array - Array of User IDs who liked the post)
- `created_at` (Timestamp)

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Neon Database** account (or local PostgreSQL)
- **Clerk** account for Authentication
- **Cloudinary** account for Image Storage & Editing
- **Hugging Face** account (Create an Access Token with Read permissions)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/creavo-ai.git
cd creavo.ai
```

### 2. Server Setup (Backend)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following variables:
```env
# Application
PORT=3000

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=your_neon_postgres_connection_string

# Hugging Face (AI Models)
HUGGINGFACE_API_KEY=your_huggingface_api_token

# Cloudinary (Image Hosting & Processing)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend development server (uses Nodemon):
```bash
npm run server
```

### 3. Client Setup (Frontend)
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env` (or `.env.local`) file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the Vite development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser. The application should now be running!

---

## 📡 API Endpoints Reference

### AI Routes (`/api/ai`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/generate-article` | Generates a full article based on a prompt. | Free/Premium |
| POST | `/generate-blog-title` | Generates blog titles from category/keywords. | Free/Premium |
| POST | `/generate-image` | Generates an image using FLUX.1. | Premium Only |
| POST | `/remove-image-background` | Removes background (multipart/form-data). | Premium Only |
| POST | `/remove-object` | Removes a specific object (multipart/form-data). | Premium Only |
| POST | `/review-resume` | Analyzes a PDF resume (multipart/form-data). | Premium Only |

### User Routes (`/api/user`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/creations` | Retrieves all creations for the authenticated user. | Authenticated |
| GET | `/community` | Retrieves all published creations for the public feed. | Authenticated |
| POST | `/like` | Toggles the like status on a specific creation. | Authenticated |

---

## 📂 Project Structure

```text
creavo.ai/
├── client/                 # Frontend React Application
│   ├── public/             # Static Assets
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Route Pages (Home, Dashboard, Tools)
│   │   ├── App.jsx         # Main App Component & Routing
│   │   ├── index.css       # Tailwind Directives & Global Styles
│   │   └── main.jsx        # React Entry Point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend Express Application
│   ├── configs/            # DB & Third-Party Integrations (Cloudinary, Multer, SQL)
│   ├── controllers/        # Business Logic (aiControllers.js, userController.js)
│   ├── middlewares/        # Authentication & Role Validation
│   ├── routes/             # API Route Definitions
│   ├── server.js           # Express App Entry Point
│   └── package.json
└── README.md
```

---

## 📸 Demo

Experience the live application here: **[Creavo.ai Live Demo](https://creavo-ai.vercel.app/)** *(If deployed)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome!
If you'd like to improve the project, please fork the repository and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

Built with ❤️ by **Sayan Chandra**

---

**Note on Usage Limiting**: The platform enforces usage limits directly via Clerk `privateMetadata`. If you wish to test premium features locally, simply update a user's metadata in the Clerk Dashboard to include `{"plan": "premium"}`.
