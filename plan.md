This is actually a much bigger project than a simple notes application.

What you're describing is a **Personal Knowledge Management System (PKMS) for Computer Science**, combined with:

* Notion
* Obsidian
* LeetCode Notes
* Personal Wiki
* Internship Journal
* Interview Preparation Tracker
* Knowledge Graph
* Question Bank

all merged into one platform specifically designed for your learning workflow.

---

# 1. Core Vision

The goal is:

> "Store every piece of knowledge related to Computer Science, DSA, Development, System Design, Internship Notes, Interview Questions, and Learning Resources in a single organized system."

Instead of:

```
Google Docs
Notion
Markdown files
Screenshots
Github Notes
PDFs
Interview Notes
```

everything lives inside one platform.

---

# 2. High Level Hierarchy

```text
Workspace
│
├── Notes Dashboard
│
├── Books
│   │
│   ├── DSA
│   │   ├── Arrays
│   │   ├── Linked List
│   │   ├── Trees
│   │   ├── Graphs
│   │   ├── DP
│   │   └── ...
│   │
│   ├── JavaScript
│   ├── React
│   ├── NextJS
│   ├── SQL
│   ├── MongoDB
│   ├── CN
│   ├── OS
│   ├── LLD
│   ├── HLD
│   ├── System Design
│   ├── Internship Notes
│   └── HSBC
│
└── Global Search
```

---

# 3. Main Entities

## Book

Example:

```text
DSA
React
MongoDB
System Design
HSBC Internship
```

Book contains:

```text
Name
Description
Cover
Priority
Tags
Created At
Updated At
```

---

## Chapter

Example:

```text
Book: DSA

Chapter:
- Arrays
- Trees
- Graph
- DP
```

---

## Page

This is the most important entity.

Example:

```text
Book
 └── Chapter
      └── Page
```

Page represents:

```text
One DSA Problem
One Theory Topic
One Interview Question
One Internship Concept
```

Examples:

```text
Two Sum

Binary Search

React useEffect

MongoDB Aggregation

TCP Handshake
```

---

# 4. Page Structure

Each page should be built from blocks.

Not fixed HTML.

Think Notion.

```text
Page

├── Heading
├── Subheading
├── Paragraph
├── Bullet List
├── Numbered List
├── Image
├── Code
├── Problem Statement
├── Constraints
├── Input
├── Output
├── Example
├── Summary
```

---

## Why Blocks?

Future flexibility.

Example:

```text
Heading

Paragraph

Image

Code

Paragraph

Code

Summary
```

or

```text
Heading

Problem Statement

Code

Image

Code

Summary
```

No restrictions.

---

# 5. DSA Special Page

DSA pages need additional fields.

```text
Title

Difficulty

Companies

Topic Tags

Problem Statement

Constraints

Input

Output

Examples

Approach 1

Approach 2

Approach 3

Summary
```

---

# 6. Multiple Code Sections

You specifically requested:

```text
Approach 1
Brute Force

Approach 2
Better

Approach 3
Optimal
```

Each approach:

```text
Title
Language
Code
Complexity
Explanation
```

Example:

```text
Optimal Approach

Language:
C++

Time:
O(N)

Space:
O(1)
```

---

# 7. Supported Languages

Use Monaco Editor.

Supports:

```text
JS
TS
HTML
CSS
C
C++
Java
Python
Go
Rust
Bash
SQL
Markdown
JSON
YAML
```

---

# 8. Tags System

This is critical.

You need two tag systems.

---

## Priority Tags

Fixed

```text
High
Medium
Low
```

Mandatory.

Applied on:

```text
Book
Chapter
Page
Question
```

---

## Custom Tags

User created.

Examples:

```text
Array
Binary Search
Google
Amazon
HSBC
Interview
Revision
Important
```

CRUD operations:

```text
Create
Edit
Delete
Merge
```

---

# 9. Global Filtering

Example:

Show:

```text
Priority = High

Tag = Binary Search
```

Results:

```text
Book A
Book B
Book C
```

Pages from all books appear.

---

# 10. Important Marking

Every entity should support:

```text
⭐ Favorite

🔥 Important

📌 Pinned
```

---

# 11. Notes Section

Landing page.

Think:

```text
Dashboard
```

Contains:

```text
Daily Notes

Quick Notes

Todo

Ideas

Interview Notes

Internship Notes
```

Editable.

Supports:

```text
Paragraph
Checklist
Bullet
Code
Image
```

---

# 12. Question Answer Module

This is separate from normal pages.

Structure:

```text
Book
 └── Q&A Section
```

---

Question

```text
What is Closure?
```

Answer

```text
Function + Lexical Environment
```

Initially:

```text
Answer Hidden
```

User clicks:

```text
Show Answer
```

Answer expands.

---

Supports:

```text
Priority

Tags

Favorite

Companies
```

---

# 13. Image System

Requirements:

### Upload

```text
Drag Drop
Paste
Browse
```

---

### Processing

Automatically:

```text
Resize

Compress

Convert WebP
```

---

Maximum:

```text
854 x 480
```

(480p)

---

Features:

```text
Zoom

Fullscreen

Caption

Alt Text
```

---

# 14. Powerful Search Engine

Must support:

```text
Search Title

Search Content

Search Tags

Search Company

Search Code

Search Chapters
```

Example:

```text
binary search
```

returns:

```text
Pages
Questions
Notes
Code
```

---

# 15. Dynamic Dashboard

Dashboard shows:

```text
Total Books

Total Chapters

Total Pages

High Priority Pages

Recently Updated

Favorites

Revision Queue
```

---

# 16. Additional Features I Strongly Recommend

## Revision Tracker

For DSA.

```text
Revision 1

Revision 2

Revision 3
```

Track dates.

---

## Spaced Repetition

Automatic reminders.

```text
1 Day

3 Days

7 Days

15 Days

30 Days
```

---

## Progress Tracking

For every book.

```text
Arrays      80%
Trees       60%
Graphs      40%
```

---

## Knowledge Graph

Very useful.

Example:

```text
Binary Search
      |
      |
Lower Bound
      |
      |
Upper Bound
```

Visual connections.

---

## Backlinks

Like Obsidian.

Inside page:

```text
[[Binary Search]]
```

Automatically linked.

---

## Version History

Every page:

```text
Version 1

Version 2

Version 3
```

Restore anytime.

---

## Export

Export:

```text
Markdown

PDF

HTML
```

---

## AI Search

Future phase.

Ask:

```text
Show all Graph problems asked in Google.

Show all SQL interview questions.

Show all notes tagged HSBC.
```

---

# Recommended Tech Stack

Since you already know MERN:

## Frontend

```text
Next.js 15
TypeScript
TailwindCSS
Shadcn UI
TanStack Query
Monaco Editor
```

---

## Backend

```text
Node.js
Express.js
TypeScript
```

---

## Database

```text
PostgreSQL
```

Not MongoDB.

Reason:

Your project is highly relational.

```text
Books
Chapters
Pages
Tags
Questions
Images
Codes
```

SQL is much better.

Use:

```text
PostgreSQL
+ Prisma ORM
```

---

## Storage

```text
AWS S3
```

or

```text
Cloudinary
```

for images.

---

## Search

```text
PostgreSQL Full Text Search
```

Initially.

Later:

```text
Elasticsearch
```

---

# Architecture

```text
Next.js Frontend
        │
        │
        ▼
API Layer
        │
        ▼
Express Backend
        │
 ┌──────┼───────┐
 │      │       │
 ▼      ▼       ▼

Postgres
Redis
S3

```

---

# Development Phases

### Phase 1

Core Notes Engine

```text
Books
Chapters
Pages
Tags
Search
```

---

### Phase 2

Rich Editor

```text
Images
Code Blocks
Markdown
```

---

### Phase 3

DSA Module

```text
Problem Statements
Approaches
Companies
Difficulty
```

---

### Phase 4

Q&A Module

```text
Flashcards
Show Answer
Priority
```

---

### Phase 5

Dashboard

```text
Analytics
Progress
Revision
```

---

### Phase 6

Knowledge Graph

```text
Connections
Backlinks
```

---

### Phase 7

AI Layer

```text
Semantic Search
AI Assistant
```

If built this way, the project becomes a portfolio-level product that demonstrates frontend engineering, backend architecture, database design, rich text editing, search systems, file handling, and system design—all while solving your own long-term note-taking and interview-preparation needs.



i am working on these project and i want to implement these project
i am getting confused help me with these project to completely free
help me architecture and infrastructure required and techstack i can use freely
these will be for creating notes and reading it regulalry on revision purpose

these is main reason how can i implement these project effectively
what should be my file structure at what phase wi must complete what parts and in hsbc i am doing internship so 
HSBC
DSA
is must book i must have option for creating more book and name and chapter and page create each page has heading and subheading then each page has these option code(multiple add code option but these is optional text below it if needed or kept blank),image(multiple allowed and in fixed image frame if required user can zoom and view the image and is of 480 p) then page will have heading(must) and subheading,theory(optional),tag(must and can be change by adding more tag or deleting any tag preent or updating ann tag and ) each book must have question answer section each question must be categorize further as high medium low i am here confuse whether i use these as like these or hard,easy medium i need more tags in dsa section and other pages like js,eact,node,next,express,sql,c,cpp,py,java,etc.
these is done to make revise all my concept in one web and notes section where notes are written and will always be display at the first landing page and book must be (creatively havbdles)
continuing question answer initally from book question will be viisble when user slected show all answer will be viiable more question can bve added and deleted and updated and their answer also and tag is given updated or delketed or created in each question 

for dsa book lets say i have chapter array and in array i my have multiple pages or concepts i can add tag for each page like leetcode or companies or topic tag or difficulty tag and edit them in ui and update them when refreshed it will be automatically updated likewise for note also i can add,update or delet any note and read ofocurse
check everything these is some clustered idea that formed in my brain help me to bring these into implementation create a structured plan and design a detailed roadmap to complete this project graciously please design a full plan give name to the repo help me to complete this project free and no cost list here everything in the chat itself











Let me now build out the full plan for you. This is a serious project — let me give you a complete, structured roadmap.

---

## 🗂️ Project Name: **NexusNotes**

**Tagline**: *Your second brain for CS, DSA, and internship mastery.*

**Repo Name**: `nexusnotes`

---

Here's the complete architecture, file structure, tech stack, and phase-by-phase roadmap:---

## Complete Free Tech Stack

**Frontend** — hosted on Vercel (free forever)
- Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn/ui
- **Tiptap** (free, open source) — block editor like Notion
- Monaco Editor — code blocks with syntax highlighting
- TanStack Query — data fetching and cache

**Backend** — hosted on Render or Railway (free tier)
- Node.js + Express.js + TypeScript
- Prisma ORM — type-safe database queries

**Database** — Neon.tech (free PostgreSQL, 512MB, no credit card)
- Full-text search built into PostgreSQL (no Elasticsearch needed at your scale)

**Cache** — Upstash Redis (free 10k requests/day)

**Images** — Cloudinary (free 25 credits/month, auto-resize/compress/WebP built in)

**Auth** — Clerk (free tier, 10k MAU) or just a simple JWT setup since it's personal

---

## Database Schema (Prisma)---

## Complete File Structure

```
nexusnotes/
├── apps/
│   ├── web/                          ← Next.js frontend
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx          ← Notes landing page (always first)
│   │   │   │   ├── books/
│   │   │   │   │   ├── page.tsx      ← All books list
│   │   │   │   │   ├── [bookId]/
│   │   │   │   │   │   ├── page.tsx  ← Book view (chapters list)
│   │   │   │   │   │   ├── [chapterId]/
│   │   │   │   │   │   │   ├── page.tsx     ← Chapter (pages list)
│   │   │   │   │   │   │   └── [pageId]/
│   │   │   │   │   │   │       └── page.tsx ← Page editor
│   │   │   │   │   │   └── qa/
│   │   │   │   │   │       └── page.tsx     ← Book Q&A section
│   │   │   │   └── search/
│   │   │   │       └── page.tsx      ← Global search
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── BlockEditor.tsx   ← Main Tiptap block editor
│   │   │   │   ├── blocks/
│   │   │   │   │   ├── CodeBlock.tsx ← Monaco code block
│   │   │   │   │   ├── ImageBlock.tsx
│   │   │   │   │   ├── HeadingBlock.tsx
│   │   │   │   │   └── TextBlock.tsx
│   │   │   │   └── toolbar/
│   │   │   │       └── EditorToolbar.tsx
│   │   │   ├── books/
│   │   │   │   ├── BookCard.tsx
│   │   │   │   ├── BookGrid.tsx
│   │   │   │   └── CreateBookModal.tsx
│   │   │   ├── tags/
│   │   │   │   ├── TagBadge.tsx
│   │   │   │   └── TagManager.tsx    ← Add/edit/delete tags inline
│   │   │   ├── qa/
│   │   │   │   ├── QuestionCard.tsx  ← Collapsible answer
│   │   │   │   └── QAList.tsx
│   │   │   ├── notes/
│   │   │   │   └── NoteBlock.tsx     ← Dashboard notes
│   │   │   └── shared/
│   │   │       ├── DifficultyBadge.tsx
│   │   │       ├── PriorityBadge.tsx
│   │   │       └── SearchBar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                ← Axios/fetch wrappers
│   │   │   └── queryClient.ts
│   │   └── package.json
│   │
│   └── server/                       ← Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── books.ts
│       │   │   ├── chapters.ts
│       │   │   ├── pages.ts
│       │   │   ├── blocks.ts
│       │   │   ├── tags.ts
│       │   │   ├── questions.ts
│       │   │   ├── notes.ts
│       │   │   ├── search.ts
│       │   │   └── images.ts
│       │   ├── controllers/          ← Business logic separate from routes
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── upload.ts         ← Multer + Cloudinary
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── redis.ts
│       │   │   └── cloudinary.ts
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma         ← ALL your models here
│       │   └── migrations/
│       └── package.json
│
├── package.json                      ← Root workspace (pnpm or npm)
└── README.md
```

---

## Phase-by-Phase RoadmapClick each phase to expand the task list.
phase 1 
✓
Monorepo setup (pnpm workspaces), ESLint, Prettier, tsconfig
✓
Prisma schema: Book, Chapter, Page, Tag, Block models
✓
Express routes: full CRUD for books, chapters, pages
✓
Next.js: sidebar with book tree (collapsible), breadcrumb nav
✓
Create/rename/delete book, chapter, page from UI
✓
Deploy: Vercel (frontend) + Render (backend) + Neon (DB)
✓
HSBC and DSA books pre-seeded so you can use it from day one


phase 2
Tiptap block editor: heading, subheading, paragraph, bullet, numbered list
✓
Tag system: create, rename, delete, color tags per page
✓
Tag categories: Topic / Company / Language / Difficulty
✓
Tags displayed as colored pills, editable inline
✓
Auto-save every 2s with debounce (no Save button needed)
✓
Priority field: Easy / Medium / Hard on every page

phase 3

Monaco Editor code block: language selector, multiple blocks per page
✓
Code block: title field + optional explanation text below
✓
DSA approach blocks: Brute / Better / Optimal each with time+space complexity
✓
Cloudinary upload: drag-drop, paste, browse — auto-compress to 480p WebP
✓
Image viewer: zoom modal, caption, fixed-aspect frame in page


phase 4

Per-book Q&A section, separate from pages
✓
Question card: collapsed by default, click to reveal answer
✓
Add / edit / delete questions and answers inline
✓
Difficulty tag: Easy / Medium / Hard on each question
✓
Company tags on questions (Google, Amazon, HSBC, etc.)
✓
Filter Q&A by difficulty or tag



phase 5

Landing page (/) shows sticky Notes section always first
✓
Note types: Daily, Quick, Todo, Ideas, Interview, Internship
✓
Each note supports paragraph, checklist, bullet, code blocks
✓
Create / pin / delete notes, reorder by drag
✓
Notes auto-save, timestamps shown


phase 6

PostgreSQL full-text search: title, content, tags, company, code
✓
Global search bar (Cmd+K shortcut) returns pages, Q&As, notes
✓
Dashboard stats: total books, chapters, pages, high-priority pages
✓
Recently updated section, Favorites section
✓
Filter pages globally by tag, difficulty, company, or book


phase 7

Revision tracker: mark page as revised, track dates
✓
Favorite / pin / important toggles on pages, questions, notes
✓
Export page as Markdown or PDF
✓
Dark mode toggle
✓
Mobile-responsive layout



---

## Tag Design (your confusion resolved)

For **DSA pages**, use these tag categories:

- **Difficulty**: Easy / Medium / Hard (standard LeetCode style — better than High/Medium/Low for DSA since it matches LeetCode and interview language)
- **Topic**: Array, Binary Search, DP, Graph, Tree, Sliding Window, Two Pointer, etc.
- **Company**: Google, Amazon, Microsoft, HSBC, Meta, etc.
- **Language**: JS, TS, C++, Java, Python, etc.
- **Status**: Revision, Important, Unsolved, etc.

For **other books** (React, Node, HSBC, etc.), the same tag system works — just use relevant category tags. Every tag is a colored pill, editable inline on the page.

---

## How to Start Right Now

```bash
# 1. Create the repo
mkdir nexusnotes && cd nexusnotes
git init
npm init -y

# 2. Create the two apps
mkdir -p apps/web apps/server

# 3. Bootstrap Next.js
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 4. Bootstrap Express backend
cd ../server
npm init -y
npm install express typescript prisma @prisma/client ts-node nodemon
npx prisma init

# 5. Set up Neon DB (free)
# → go to neon.tech, create project, copy DATABASE_URL to .env

# 6. Set up Cloudinary (free)
# → cloudinary.com, create account, copy API keys to .env
```

Start with Phase 1 only. Get books → chapters → pages working as plain text first. Everything else layers on top once the core tree works.

The total estimated time to a fully usable personal tool (Phase 1–6) is about **8–12 weeks** at a comfortable pace. You can use NexusNotes for your HSBC internship and DSA prep within 3–4 weeks just from Phase 1–3.





--------------


---

## Where you actually are

**Phase 1 — ~75% done.** The monorepo, Prisma schema, all backend CRUD routes (books/chapters/pages/tags/questions), and the sidebar tree with create modals are working. What's missing: rename/delete UI for books, chapters, and pages, and breadcrumb navigation.

**Phase 2 — ~65% done.** Tiptap editor is integrated, tag system (backend + TagManager UI) works, and auto-save with debounce is in place. What's missing: the priority/difficulty field is not shown or editable in the page UI, tag color picker is hardcoded, and no tag editing (rename/recolor) exists.

**Phase 3 — ~55% done.** Monaco CodeBlock extension and DSABlock extension exist and render. Cloudinary image upload via drag/paste is wired. What's missing: DSABlock doesn't embed a code editor (just a textarea), there's no image zoom modal, no caption, and image compression to 480p is not applied.

**Phase 4 — ~40% done.** Backend Q&A routes exist (GET/POST/PUT/DELETE), and the QA display page renders flashcards beautifully. What's missing: zero UI to add, edit, or delete questions — the entire CRUD interaction is missing from the frontend.

**Phases 5, 6, 7 — 0%.** Not started at all. Landing page is still the default Next.js boilerplate.

---

## The 24 vulnerabilities, prioritised

All are listed in the widget above. Here's the grouping:

**4 Critical — fix before anything else:**
1. `.env` with real credentials is in the repo/snapshot — rotate your Cloudinary API secret and generate a new DB password immediately
2. `API_URL = 'http://localhost:5000/api'` hardcoded in 6+ files — will be dead on Vercel
3. Zero authentication — your entire DB is public
4. `updatePageBlocks` delete-all-then-insert — content loss on transaction failure

**8 High — fix before moving to next phase:**
5. No backend input validation (no Zod schema on any route)
6. Image upload has no file-type check or size limit
7. No 480p compression on Cloudinary upload
8. QA page has no add/edit/delete UI
9. Landing page is still Next.js template
10. No rename/delete UI for books, chapters, pages
11. Tag color is hardcoded grey — color system non-functional
12. No Notes routes/controllers on backend at all

**12 Medium — fix within current phase:**
13–24: Chapter order bug, DSABlock missing code editor, wrong Tiptap insert method, v3 compatibility risk, no breadcrumbs, no error boundaries, CORS wide open, no search route, no inline page title editing, no difficulty/companies UI on page, chapter listing missing tags, Note model missing timestamps

---

## The correction plan before moving forward

### Step 1 — Security & config (1–2 hours)
- Rotate Cloudinary secret and DB password right now
- Add `.env` to `.gitignore` at both root and `apps/server/` level
- Create `apps/web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api` and replace every hardcoded `API_URL` constant with `process.env.NEXT_PUBLIC_API_URL`
- Lock CORS: `app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }))`

### Step 2 — Data safety (1–2 hours)
- Fix `updatePageBlocks`: instead of delete-all, do an upsert — diff incoming blocks against existing, update matches, insert new, delete removed
- Add Zod validation to at minimum `createBook`, `createPage`, `createChapter`, `createQuestion`
- Add Multer file filter: only allow `image/jpeg`, `image/png`, `image/webp`, `image/gif`, max 5MB

### Step 3 — Complete Phase 1 gaps (2–3 hours)
- Add rename/delete context menus to sidebar (right-click or kebab menu per book/chapter/page)
- Add breadcrumb component: `Book > Chapter > Page` at top of page view, linking each level
- Fix chapter order: send `order: chapters.length` from a fresh count, not from cached state

### Step 4 — Complete Phase 2 gaps (2–3 hours)
- Add priority selector (Easy / Medium / Hard) to page header alongside tags
- Add companies and type (DSA / Theory) fields to page header
- Add inline page title editing (click h1 to edit, blur to save)
- Fix tag creation to accept a color from a small preset palette (8 colors, no picker needed)
- Add tag edit/delete on the TagManager (update tag name or color globally)

### Step 5 — Complete Phase 3 gaps (2 hours)
- Add Monaco editor inside DSABlock below the complexity fields
- Add Cloudinary transformation on upload: `width: 854, height: 480, crop: 'limit'` in the uploader options
- Build image zoom modal: click any image in editor → full-screen overlay with caption display
- Fix CodeBlock insert: use `editor.chain().focus().insertContent({ type: 'monacoCodeBlock', attrs: { language: 'javascript', code: '' } }).run()`

### Step 6 — Complete Phase 4 (3–4 hours)
- Build full QA CRUD on the QA page: Add Question form (question text + answer textarea + difficulty + companies), edit inline on card, delete button
- Add filter bar: filter by difficulty (Easy / Medium / Hard) and by company tag
- Add isFavorite toggle on each question card

### Step 7 — Error handling baseline (1 hour)
- Wrap every page in a React `<ErrorBoundary>` component
- Add `isError` state handling in all TanStack Query calls with a visible error message
- Add `try/catch` with proper status codes to all Express controllers (already partial — make it consistent)

---

## Forward plan: Phases 5–7

### Phase 5 — Notes dashboard (1 week)

**Backend first:**
- Add `notesRouter` to `src/routes/notes.ts` — CRUD for notes
- Add `createdAt` and `updatedAt` to Note schema in Prisma, run migration
- Add `isPinned` reorder: `PATCH /api/notes/:id/pin`

**Frontend:**
- Replace `apps/web/src/app/page.tsx` completely — make it a real Notes dashboard
- Build `NoteCard` component: type badge (Daily/Quick/Todo etc.), title, timestamp, pin button, delete
- Notes support the same Tiptap editor (reuse `BlockEditor`) but with checklist extension added
- Drag-to-reorder using browser drag API or a lightweight lib like `@hello-pangea/dnd`
- Layout: sticky header row with "New Note" button and type filter, then masonry or vertical card grid

### Phase 6 — Search + dashboard stats (1 week)

**Backend:**
- Add `GET /api/search?q=` route using PostgreSQL full-text search:
  ```sql
  WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery($1)
  ```
  Search across pages, questions, notes simultaneously, return typed results
- Add `GET /api/dashboard/stats` — counts for books, chapters, pages, high-priority pages, recently updated

**Frontend:**
- Cmd+K opens a `CommandDialog` (shadcn already has this — `cmdk` is already installed)
- Search input calls `/api/search`, results grouped by type (Pages / Questions / Notes) in the command palette
- Build a Dashboard section at top of home page: 4 stat cards (total books, pages, high priority, recent)
- "Recently Updated" and "Favorites" sections below stats

### Phase 7 — Polish + deployment (1 week)

**Revision tracker:**
- Add `revisedAt DateTime[]` to Page model (array of timestamps), migration
- "Mark as Revised" button on page view appends current timestamp

**Export:**
- Markdown export: convert Tiptap JSON to markdown using `@tiptap/pm` serializer
- PDF export: use `window.print()` with a print-specific CSS `@media print` stylesheet (free, no library)

**Dark mode:**
- Add a theme toggle button to sidebar footer
- `next-themes` package (1-line install) handles the rest with the CSS variables already in `globals.css`

**Mobile layout:**
- Sidebar becomes a slide-over drawer on mobile (Tailwind `lg:block hidden` + hamburger button)
- Page editor toolbar wraps on small screens — already partially handled by `flex-wrap`

**Deployment:**
- Frontend: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api` in Vercel environment variables
- Backend: `DATABASE_URL`, `CLOUDINARY_*`, `ALLOWED_ORIGIN=https://your-vercel-app.vercel.app` in Render environment variables
- Run `prisma migrate deploy` on Render build step, not `migrate dev`
- Add a `render.yaml` for one-click backend deploy config

---

The most important thing right now: fix the 4 critical issues (credentials, hardcoded URL, auth gap, block delete-all) before you write a single line of new feature code. Everything else can be layered on top cleanly once those are stable.



Tag creation in page.tsx uses hardcoded color #3f3f46
Every newly created tag gets the same grey color regardless of input. No color picker exposed — tag color system is non-functional.
HIGH
No Notes model routes or API at all
Note model exists in Prisma schema but there are zero backend routes or controllers for notes. Phase 5 has no backend support.
MEDIUM
Sidebar: chapter order uses array length (wrong)
createChapter sends order: books.find().chapters.length, which is the pre-insert count. New chapter always gets wrong order if data is stale.
MEDIUM
DSABlock has no Monaco code editor embedded
DSABlock only has approach type, time/space complexity, and a textarea. The DSA code editor (Brute/Better/Optimal code blocks) is missing.
MEDIUM
CodeBlock extension inserts as raw HTML string (wrong approach)
Toolbar inserts code block via insertContent with raw HTML div string. Tiptap custom nodes should be inserted using insertContentAt with node JSON, not HTML strings.
MEDIUM
Tiptap v3 used but extensions may behave differently
Package uses @tiptap/react ^3.23.6 (v3 is still pre-stable). API changes between v2 and v3 can break extensions — no version pinning or compatibility check.
MEDIUM
No breadcrumb navigation on page
Phase 1 planned breadcrumb nav (Book → Chapter → Page). Not implemented. Users have no context of where they are in the hierarchy while editing.
MEDIUM
No error boundaries — any query failure crashes the page
TanStack Query errors are unhandled silently. No React error boundary. A failed API call shows a blank page with no user feedback.
MEDIUM
CORS is wide open (cors() with no config)
Backend uses app.use(cors()) with no origin restriction. Any website can make cross-origin requests to your API.
MEDIUM
No search route on backend at all
Sidebar has a Search button but it does nothing — no onClick handler, no route, no backend endpoint. Phase 6 search is completely absent.
MEDIUM
No page title editing in the page view
Page title is shown as a static h1. There's no inline rename UI on the page view itself — the title can only be set at creation time.
MEDIUM
No difficulty/priority field visible on page view
Page has difficulty and companies fields in schema and createPage, but none of these are shown or editable on the page editor UI.
MEDIUM
getPagesByChapterId doesn't include tags or blocks
Chapter page listing calls getPagesByChapterId which returns bare pages with no pageTags. Chapter view can't show tag pills on the pages list.
MEDIUM
No updatedAt on Note model in schema
Note model is missing updatedAt and createdAt timestamps. Plan requires showing timestamps on notes — schema doesn't support it.


Vulnerabilities & weaknesses found
CRITICAL
API keys exposed in .env committed to repo
DATABASE_URL, Cloudinary secret, API key all visible in snapshot. Anyone with repo access has full DB + storage access.
CRITICAL
Hardcoded localhost:5000 across all frontend files
API_URL is hardcoded in every page and Sidebar. Will break completely on Vercel deploy with zero graceful fallback.
CRITICAL
No auth — app is fully public
Zero authentication on any route. Any person with the backend URL can read/write/delete all your notes and data.
CRITICAL
Blocks saved as delete-all + re-insert (data loss risk)
updatePageBlocks deletes ALL blocks then re-creates them in a transaction. If the transaction fails mid-way, page content is wiped permanently.
HIGH
No input validation anywhere on backend
createBook, createChapter, createPage all accept any payload blindly. No Zod/Joi validation — malformed data silently corrupts DB or crashes server.
HIGH
Image upload has no file-type or size limit
Multer accepts anything. No mimetype check, no file size cap. Easily abused to exhaust Cloudinary free tier or upload malicious files.
HIGH
No image compression to 480p before Cloudinary upload
Plan specifies auto-compress to 480p WebP. Code uploads raw buffer with only format:'webp'. Large images eat Cloudinary bandwidth limits fast.
HIGH
QA page is read-only — no CRUD UI
QA page only shows questions. No UI to add, edit or delete questions. The backend routes exist but are completely unwired in frontend.
HIGH
Landing page (/) is still the default Next.js template
page.tsx is the boilerplate create-next-app page. Phase 5 Notes dashboard hasn't been built at all.
HIGH
No rename/delete for books, chapters, or pages in UI
Backend routes for update/delete exist but the sidebar only has Create. You can't rename or delete anything from the UI.