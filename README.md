# Creavo.ai 🧠✨

**Creavo.ai** is a modern, all-in-one AI-powered creative and productivity platform built with the **PERN stack** (PostgreSQL, Express, React, Node.js). It empowers users to generate content, edit images, and analyze resumes using advanced AI models.

## 🚀 Features

### ✍️ Content Generation
- **Article Generator**: Create full-length, structured articles on any topic with custom length settings.
- **Blog Title Generator**: Get catchy, SEO-friendly blog titles based on keywords and categories.

### 🎨 Image Tools
- **AI Image Generator**: Turn text prompts into stunning visuals.
- **Background Remover**: Instantly remove backgrounds from images with precision.
- **Object Remover**: Clean up images by removing unwanted objects seamlessly.

### 💼 Career Tools
- **Resume Analyzer**: Upload your resume to receive detailed feedback and AI-driven improvement suggestions.

### 🌐 Community & Dashboard
- **Community Feed**: browse and get inspired by creations from other users.
- **Personal Dashboard**: Manage your generated content and history.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State/Routing**: React Router DOM
- **Authentication**: [Clerk](https://clerk.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech))
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **AI Integration**: [Hugging Face Inference](https://huggingface.co/docs/huggingface.js/inference/README)

### AI Models Used (Free & Fast) ⚡
- **Text Generation**: `meta-llama/Llama-3.2-1B-Instruct`
- **Image Generation**: `black-forest-labs/FLUX.1-schnell`

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database (or Neon account)
- Clerk account
- Cloudinary account
- Hugging Face API Token (Read access)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/creavo-ai.git
cd creavo.ai
```

### 2. Server Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=3000
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
HUGGINGFACE_API_KEY=your_huggingface_api_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DATABASE_URL=your_neon_postgres_connection_string
```

Start the server:
```bash
npm run server
# or
npm start
```

### 3. Client Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the React development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to explore the app.

---

## 📸 Demo

*(https://creavo-ai.vercel.app/)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 👨‍💻 Author

Built with ❤️ by **Sayan Chandra**
