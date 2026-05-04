const META_BASE = "/api"; // json-server  → Vite proxy → :3001
const GATEWAY_BASE = "/gateway"; // gateway      → Vite proxy → :8084

async function request(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  if (res.status === 204) return null;
  return res.json();
}

const meta = (path, opts) => request(META_BASE, path, opts);
const gateway = (path, opts) => request(GATEWAY_BASE, path, opts);

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function fileExtension(fileName) {
  if (!fileName) return "FILE";
  return fileName.split(".").pop().toUpperCase();
}

function toDocUUID(id) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(String(id))) return String(id);
  const padded = String(id).padStart(12, "0");
  return `00000000-0000-0000-0000-${padded}`;
}

export const api = {
  // ── Users (json-server) ───────────────────────────────────────────────────
  getUsers: () => meta("/users"),
  getUser: (id) => meta(`/users/${id}`),
  createUser: (data) => meta("/users", { method: "POST", body: data }),
  updateUser: (id, data) =>
    meta(`/users/${id}`, { method: "PATCH", body: data }),
  deleteUser: (id) => meta(`/users/${id}`, { method: "DELETE" }),

  loginUser: async (email, password) => {
    const users = await meta("/users");
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) throw new Error("Invalid credentials");
    if (user.status === "suspended") throw new Error("Account suspended");
    return user;
  },

  // ── Documents (via gateway → :8082) ──────────────────────────────────────

  getDocuments: () => gateway("/api/documents"),
  getDocument: (id) => gateway(`/api/documents/${id}`),
  updateDocument: (id, data) =>
    gateway(`/api/documents/${id}`, { method: "PATCH", body: data }),

  deleteDocument: async (id) => {
    const res = await fetch(`${GATEWAY_BASE}/api/documents/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  },

  // ── Upload via MinIO pre-signed URL ───────────────────────────────────────
  //
  //  1. POST /gateway/api/documents/presign   → { uploadUrl, objectKey, downloadUrl }
  //  2. PUT  <uploadUrl>                      → file goes directly browser → MinIO
  //  3. POST /gateway/api/documents/register  → Spring saves full record in PostgreSQL
  //  4. POST /api/versions                    → version 1.0.0 entry (json-server)
  //
  uploadDocument: async (metaData, file) => {
    // 1. Get pre-signed PUT URL via gateway
    const presign = await gateway("/api/documents/presign", {
      method: "POST",
      body: {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      },
    });
    const { uploadUrl, downloadUrl, objectKey } = presign;

    // 2. PUT file directly to MinIO — bypasses gateway entirely
    const minioRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!minioRes.ok)
      throw new Error(`MinIO upload failed: ${minioRes.status}`);

    // 3. Register full document in Spring Boot via gateway
    const doc = await gateway("/api/documents/register", {
      method: "POST",
      body: {
        title: metaData.title,
        description: metaData.description || "",
        status: metaData.status || "draft",
        categoryId: metaData.categoryId,
        departmentId: metaData.departmentId,
        authorId: metaData.authorId,
        tags: metaData.tags || [],
        currentVersion: "1.0.0",
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
        s3Key: objectKey,
        downloadUrl,
      },
    });

    // 4. Create initial version entry in json-server
    await meta("/versions", {
      method: "POST",
      body: {
        documentId: String(doc.id),
        version: "1.0.0",
        authorId: metaData.authorId,
        changelog: "Initial upload",
        fileSize: doc.fileSizeDisplay,
        createdAt: new Date().toISOString(),
      },
    });

    return doc;
  },

  // ── Download — fresh pre-signed GET URL from MinIO ────────────────────────

  downloadDocument: async (id) => {
    const res = await fetch(`${GATEWAY_BASE}/api/documents/${id}/download-url`);
    if (!res.ok) throw new Error(`Could not get download URL: ${res.status}`);
    const url = await res.text();

    const doc = await gateway(`/api/documents/${id}`);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName || `document-${id}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  getDownloadUrl: async (id) => {
    const res = await fetch(`${GATEWAY_BASE}/api/documents/${id}/download-url`);
    return res.ok ? res.text() : null;
  },

  // ── Versions (json-server) ────────────────────────────────────────────────
  getVersions: (documentId) => meta(`/versions?documentId=${documentId}`),
  createVersion: (data) => meta("/versions", { method: "POST", body: data }),

  // ── Comments (via gateway → :8083) ───────────────────────────────────────

  getComments: async (documentId) => {
    const docUUID = toDocUUID(documentId);
    const res = await fetch(`${GATEWAY_BASE}/api/comments/list/${docUUID}`);
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((c) => ({
      id: c.commentId,
      documentId: String(documentId),
      authorId: c.author,
      content: c.content,
      createdAt: c.createdAt ?? new Date().toISOString(),
      edited: false,
    }));
  },

  createComment: async (data) => {
    const docUUID = toDocUUID(data.documentId);
    const res = await fetch(`${GATEWAY_BASE}/api/comments/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docId: docUUID,
        content: data.content,
        author: data.authorId,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    const c = await res.json();
    return {
      id: c.commentId,
      documentId: String(data.documentId),
      authorId: c.author,
      content: c.content,
      createdAt: c.createdAt ?? new Date().toISOString(),
      edited: false,
    };
  },

  deleteComment: async (id, documentId) => {
    const docUUID = toDocUUID(documentId);
    const commentUUID = id;
    const res = await fetch(
      `${GATEWAY_BASE}/api/comments/${docUUID}/${commentUUID}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error(`Delete comment failed: ${res.status}`);
  },

  updateComment: async (id, data) => {
    const docUUID = toDocUUID(data.documentId);
    const commentUUID = id;
    const res = await fetch(
      `${GATEWAY_BASE}/api/comments/${docUUID}/${commentUUID}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      },
    );
    if (!res.ok) throw new Error(`Update comment failed: ${res.status}`);
    const c = await res.json();
    return {
      id: c.commentId,
      documentId: String(data.documentId),
      authorId: c.author,
      content: c.content,
      createdAt: c.createdAt ?? new Date().toISOString(),
      edited: true,
    };
  },

  // ── Departments (json-server) ─────────────────────────────────────────────
  getDepartments: () => meta("/departments"),
  createDepartment: (data) =>
    meta("/departments", { method: "POST", body: data }),
  updateDepartment: (id, data) =>
    meta(`/departments/${id}`, { method: "PATCH", body: data }),
  deleteDepartment: (id) => meta(`/departments/${id}`, { method: "DELETE" }),

  // ── Categories (json-server) ──────────────────────────────────────────────
  getCategories: () => meta("/categories"),
  createCategory: (data) => meta("/categories", { method: "POST", body: data }),
  updateCategory: (id, data) =>
    meta(`/categories/${id}`, { method: "PATCH", body: data }),
  deleteCategory: (id) => meta(`/categories/${id}`, { method: "DELETE" }),
};
