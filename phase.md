# NexusNotes - AI Implementation Plan & Phases

This document serves as the roadmap and internal state for the AI to build out NexusNotes methodically, following the established architecture and requirements.

## Architecture Context
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn/ui.
  - Key tools: Tiptap (Block Editor), Monaco Editor (Code Blocks), TanStack Query (Data Fetching).
- **Backend**: Node.js, Express.js, TypeScript.
  - Key tools: Prisma ORM.
- **Data Layer**: PostgreSQL (Neon.tech) with Full-Text Search, Redis (Upstash) for cache/sessions, Cloudinary for images.

## Database Schema Highlights
- **Book**: id, name, desc, priority, cover, timestamps
- **Chapter**: id, title, bookId, order, priority, isFavorite
- **Page**: id, title, chapterId, type, difficulty, companies, isFavorite, isPinned
- **Block**: id, pageId, type, content, order, language, complexity
- **Tag**: id, name, color, category
- **PageTag**: many-to-many junction for Page and Tag
- **Question**: id, bookId, question, answer, difficulty, companies, tags, isFavorite
- **Note**: id, title, type, content, isPinned

---

## Phase 1: Core Structure & Setup (2-3 weeks)
- [ ] **Infrastructure**: Verify Monorepo setup, ESLint, Prettier, tsconfig.
- [ ] **Database**: Define full Prisma schema (`Book`, `Chapter`, `Page`, `Tag`, `Block`, `Question`, `Note`). Run migrations.
- [ ] **Backend API**: Implement Express routes (CRUD for books, chapters, pages).
- [ ] **Frontend Layout**: Build Sidebar with collapsible book tree and breadcrumb navigation.
- [ ] **Frontend Features**: UI for Create/Rename/Delete of Books, Chapters, and Pages.
- [ ] **Seeding**: Pre-seed initial data (HSBC and DSA books).

## Phase 2: Block Editor + Tags (2-3 weeks)
- [ ] **Editor**: Integrate Tiptap block editor (headings, paragraphs, lists).
- [ ] **Tags API**: Implement Tag system (CRUD for tags, colors per page).
- [ ] **Tag Categories**: Setup Tag categories (Topic, Company, Language, Difficulty).
- [ ] **Tags UI**: Build UI for inline editable colored pill tags.
- [ ] **Auto-save**: Implement Auto-save logic (2s debounce) from frontend to backend.
- [ ] **Metadata**: Add Priority field (Easy/Medium/Hard) to pages.

## Phase 3: Code + Images (1-2 weeks)
- [ ] **Code Editor**: Integrate Monaco Editor for code blocks (with language selector).
- [ ] **Code Blocks**: Add title + explanation text for code blocks.
- [ ] **DSA Blocks**: Create specialized blocks (Brute / Better / Optimal with time/space complexity).
- [ ] **Image Upload**: Cloudinary integration for image upload (drag-drop, paste, auto-compress).
- [ ] **Image Viewer**: Build Image viewer UI (zoom modal, caption).

## Phase 4: Q&A Module (1 week)
- [ ] **Q&A Layout**: Create per-book Q&A section, separate from pages.
- [ ] **Q&A UI**: Build Question card UI (collapsible answers).
- [ ] **Q&A CRUD**: Inline Add/Edit/Delete for Questions and Answers.
- [ ] **Q&A Metadata**: Add Difficulty and Company tags to questions.
- [ ] **Filtering**: Implement Q&A filtering by tags/difficulty.

## Phase 5: Notes Dashboard (1 week)
- [ ] **Dashboard Layout**: Build landing page (`/`) with sticky Notes section.
- [ ] **Note Data**: Implement Note types (Daily, Quick, Todo, Ideas, Interview, Internship).
- [ ] **Note Editor**: Support rich text and code blocks in notes.
- [ ] **Note Management**: Note management (create, pin, delete, drag reorder).
- [ ] **Note Persistence**: Notes auto-save and timestamps display.

## Phase 6: Search + Dashboard (1 week)
- [ ] **Backend Search**: Implement PostgreSQL full-text search across titles, content, tags, companies, code.
- [ ] **Global Search**: Build Global search bar (Cmd+K) returning pages, Q&As, notes.
- [ ] **Stats**: Display dashboard statistics (total counts, high-priority items).
- [ ] **Dashboard Sections**: Add sections for 'Recently Updated' and 'Favorites'.
- [ ] **Global Filters**: Enable global filtering functionality.

## Phase 7: Polish + Export (1 week)
- [ ] **Tracking**: Revision tracker logic (mark as revised, track dates).
- [ ] **Toggles**: Toggle logic for Favorite/Pin/Important across entities.
- [ ] **Export**: Export functionality (Markdown / PDF).
- [ ] **Theming**: Global Dark mode toggle.
- [ ] **Responsive**: Final mobile-responsive layout adjustments.
