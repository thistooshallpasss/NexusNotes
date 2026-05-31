# 🧠 NexusNotes — Your CS & DSA Second Brain

NexusNotes is a production-ready, full-stack monorepo designed to serve as a personal developer's workspace and knowledge hub. It features a rich text block editor with inline Monaco code editors for DSA, spaced-repetition Q&A flashcards, interactive note cards with drag-to-reorder lists, global tag management, command-palette search, and administrative passcode security.

---

## 🚀 Key Features

* **Sleek Glassmorphic Security Gate**: Passcode authentication layer protects your administrative workspace from public access.
* **Interactive Notes Dashboard**: 
  * Adaptive color-coded notes categorized by types (`Daily`, `Quick`, `Todo`, `Ideas`, `Interview`, `Internship`).
  * Drag-and-drop interactive grid to customize note ordering.
  * Pinned notes priority and live note search.
* **Structured Knowledge Tree**: Collapsible Book/Chapter/Page sidebar tree with Rename, Create, and Delete actions.
* **Tiptap Block Editor**: Custom content block editor supporting checkboxes, headings, lists, links, image drops, and full-screen zoom overlays.
* **Embedded Monaco Code Editor**: DSA blocks feature embedded Monaco code editors (dynamic heights scaling between 150px and 800px) with custom tab-interception to prevent bubbling key events.
* **Q&A Flashcards**: Active revision board with filtering (by difficulty, companies, or tags) and a global "Reveal/Hide All Answers" toggle.
* **Command Palette (Cmd+K)**: Instant, keyboard-navigable search scanning pages, notes, and questions in real time.
* **Markdown & PDF Exports**: Download pages as structured markdown files instantly or export them to PDF with print-optimized layouts.
* **Automated Cloudinary Media Compressor**: Enforces magic bytes signature checks on uploads, compressing images into 480p WebP format.

---

## 🛠 Tech Stack

### Frontend (Next.js Monorepo Workspace)
* **Framework**: Next.js 16 (Turbopack)
* **State Management**: TanStack React Query v5 (Optimistic Updates)
* **Styling**: Tailwind CSS v4
* **Text Editor**: Tiptap Editor Core
* **Code Editor**: `@monaco-editor/react`
* **Components**: Radix UI Primitives & Lucide Icons

### Backend (Express API Workspace)
* **Runtime**: Node.js & TypeScript
* **Database Access**: Prisma Client v7 (ORM)
* **Database**: PostgreSQL (Hosted on Neon)
* **Validation**: Zod Schemas
* **Media Uploads**: Multer & Cloudinary SDK

---

## 💻 Local Setup & Development

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** (v20+ recommended)
* **npm** (v10+ recommended)

### 2. Clone and Install Dependencies
Install all workspace dependencies from the root directory:
```bash
git clone https://github.com/thistooshallpasss/NexusNotes.git
cd NexusNotes
npm install
```

### 3. Environment Configurations
Create a `.env` file under `apps/server/` matching the template:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=5001
API_KEY="your-passcode-here"
ALLOWED_ORIGIN="http://localhost:3000"
```

Create a `.env.local` file under `apps/web/` for the client:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

### 4. Database Setup & Sync
Initialize the PostgreSQL tables with Prisma Client:
```bash
npx prisma db push --schema=apps/server/prisma/schema.prisma
```

### 5. Running the Monorepo
Start both frontend and API workspaces in parallel:
```bash
npm run dev
```
* **Frontend client**: Runs at `http://localhost:3000`
* **API backend**: Runs at `http://localhost:5001`

---

## ☁️ Deployment Guide (Render)

This project is configured for seamless deployment on Render.

### 1. Setup Your Web Services
Create two web services on Render:
1. **API Web Service** (`nexusnotes-api`):
   * **Root Directory**: `.`
   * **Build Command**: `npm install && npm run build --workspace=server`
   * **Start Command**: `node apps/server/dist/index.js`
2. **Frontend Web Service** (`nexusnotes-web`):
   * **Root Directory**: `.`
   * **Build Command**: `npm install && npm run build --workspace=web`
   * **Start Command**: `npm run start --workspace=web`

### 2. Configure Environment Variables
On Render's Dashboard, add the following variables:
* **For `nexusnotes-api`**:
  * `DATABASE_URL` (your Neon connection string)
  * `API_KEY` (your private passcode to unlock the app)
  * `CLOUDINARY_CLOUD_NAME`
  * `CLOUDINARY_API_KEY`
  * `CLOUDINARY_API_SECRET`
  * `ALLOWED_ORIGIN` (set to `https://nexusnotes-web.onrender.com`)
* **For `nexusnotes-web`**:
  * `NEXT_PUBLIC_API_URL` (set to `https://nexusnotes-api.onrender.com/api`)

---

## 📝 License
This project is private and intended for personal educational usage.
