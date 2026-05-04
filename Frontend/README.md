# DocVault — Document Management System

A full-featured document management system built with React + Vite + React Router + Context/useReducer + json-server.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (for E2E tests)
npx playwright install chromium

# 3. Start everything (Vite dev server + json-server API)
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@docvault.io      | admin123   |
| User  | bob@docvault.io        | user123    |
| User  | carol@docvault.io      | user123    |

## Features Checklist

### ✅ State Management
- `Context + useReducer` in `src/contexts/AppContext.jsx`
- Actions for documents, users, departments, categories, auth, UI (toast)
- Session persistence via `sessionStorage`

### ✅ Document List with Search
- Full-text search across title, description, and tags
- Debounced input with clear button
- Grid / List view toggle

### ✅ Special Filters
- Category filter chips (one per category, all toggleable)
- Status filter (Published / Draft)
- Sort by: Last Updated, Date Created, Title A–Z
- "Clear filters" resets all at once

### ✅ Comments UI Box (separate component)
- `src/components/comments/CommentsBox.jsx`
- Post, edit (own), delete (own) comments
- Shows author avatar, time-ago stamp, "edited" indicator

### ✅ Pagination (reusable component)
- `src/components/common/Pagination.jsx`
- Used for Documents list AND Users table
- Shows "Showing X–Y of N" info + page number buttons with ellipsis

### ✅ Admin — Add Users
- Create / Edit / Suspend individual users
- Full form: name, email, password, role, department, status

### ✅ Admin — Assign Users to Departments
- Department management with card-based UI
- "Manage Members" modal with checkbox list assignment

### ✅ Version Control
- Each document has a version timeline
- Create new version with patch/minor/major bump selector
- Changelog per version, author tracking, file size per version

### ✅ E2E Tests (Playwright)
- 20+ test cases across 5 test suites in `tests/e2e.spec.js`
- Authentication & role redirect
- Document list: search, filters, pagination, upload modal
- Document detail: tabs, versions, comments
- Admin user management: search, multi-select, create
- Admin departments

## Extra Features

- **CSV Import Wizard** — 3-step wizard (Upload → Preview with validation → Done) in Users admin
- **CSV Export** — Export all or selected users to CSV
- **Multi-select bulk actions** — Select multiple users, bulk suspend/activate/export
- **Category Management** — Create categories with custom icon picker + color picker
- **Role-based routing** — Admin sees admin sidebar, user sees user sidebar; wrong role → redirect
- **Document upload modal** — Drag & drop file zone, auto-fills title/type/size from file
- **Version bump UX** — Visual patch/minor/major selector showing the resulting version number
- **Responsive grid** — Document list auto-fills columns based on viewport
- **Toast notifications** — Global toast for all actions (success/error/warning)
- **Persistent session** — Auth survives page refresh via sessionStorage

## Project Structure

```
src/
├── contexts/
│   └── AppContext.jsx        # Context + useReducer (all state)
├── utils/
│   └── api.js                # All fetch calls to json-server
├── components/
│   ├── layouts/
│   │   ├── UserLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── common/
│   │   ├── Pagination.jsx    # Reusable pagination
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   └── comments/
│       └── CommentsBox.jsx   # Separate comment component
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── user/
│   │   ├── DocumentList.jsx  # Search + filters + pagination + upload
│   │   └── DocumentDetail.jsx # Metadata + versions + comments
│   └── admin/
│       ├── UsersManagement.jsx      # Table + multiselect + CSV import/export
│       ├── DepartmentManagement.jsx # Cards + member assignment
│       └── CategoryManagement.jsx   # Icon + color picker
├── App.jsx                   # Router + protected routes
├── main.jsx
└── index.css                 # Complete design system
tests/
└── e2e.spec.js               # Playwright E2E tests
db.json                       # json-server fake API database
```

## Running Tests

```bash
# Run all E2E tests (starts dev server automatically)
npm test

# Open Playwright UI for interactive test running
npm run test:ui
```
