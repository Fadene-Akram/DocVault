import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import {
  FileText,
  FileType,
  Sheet,
  Presentation,
  File,
  Search,
  X,
  LayoutGrid,
  List,
  Upload,
  Loader2,
  FolderOpen,
  Tag,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const PAGE_SIZE = 6;

const FILE_ICONS = {
  PDF: FileType,
  DOCX: FileText,
  XLSX: Sheet,
  PPTX: Presentation,
  TXT: File,
  default: File,
};

const FILE_COLORS = {
  PDF: "#e84f3d",
  DOCX: "#2b7cd3",
  XLSX: "#1e8449",
  PPTX: "#d35400",
  TXT: "#6B7280",
  default: "#6B7280",
};

export default function DocumentList() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [docs, cats, depts] = await Promise.all([
          api.getDocuments(),
          api.getCategories(),
          api.getDepartments(),
        ]);
        dispatch({ type: "SET_DOCUMENTS", payload: docs });
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "SET_DEPARTMENTS", payload: depts });
      } catch {
        toast("Failed to load documents", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let docs = state.documents;
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags?.some((t) => t.includes(q)),
      );
    }
    if (filterCat) docs = docs.filter((d) => d.categoryId === filterCat);
    if (filterStatus) docs = docs.filter((d) => d.status === filterStatus);
    if (filterDept) docs = docs.filter((d) => d.departmentId === filterDept);
    docs = [...docs].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "createdAt")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return docs;
  }, [state.documents, search, filterCat, filterStatus, filterDept, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getCategoryName(id) {
    return state.categories.find((c) => c.id === id)?.name || "";
  }
  function getCategoryColor(id) {
    return state.categories.find((c) => c.id === id)?.color || "#6B7280";
  }

  function resetFilters() {
    setSearch("");
    setFilterCat("");
    setFilterStatus("");
    setFilterDept("");
    setPage(1);
  }

  const hasActiveFilters = filterCat || filterStatus || filterDept;

  if (loading)
    return (
      <div className="loading-screen" style={{ minHeight: "100vh" }}>
        <Loader2 size={24} className="spin" />
        <span>Loading documents…</span>
      </div>
    );

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <span className="topbar-title">Documents</span>
        <div className="topbar-actions">
          <button
            className="btn btn-ghost btn-icon"
            title={
              viewMode === "grid"
                ? "Switch to list view"
                : "Switch to grid view"
            }
            onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
          >
            {viewMode === "grid" ? (
              <List size={16} />
            ) : (
              <LayoutGrid size={16} />
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
            data-testid="upload-btn"
          >
            <Upload size={14} />
            Upload Document
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Search + Sort row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 14,
            alignItems: "center",
          }}
        >
          <div className="search-bar" style={{ flex: 1 }}>
            <Search
              size={15}
              className="search-icon"
              style={{ color: "var(--gray-400)" }}
            />
            <input
              placeholder="Search by title, description or tag…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              data-testid="search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gray-400)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <SlidersHorizontal
              size={13}
              style={{
                position: "absolute",
                left: 10,
                color: "var(--gray-400)",
                pointerEvents: "none",
              }}
            />
            <select
              className="form-select"
              style={{ width: 178, paddingLeft: 28 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updatedAt">Last updated</option>
              <option value="createdAt">Date created</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <span className="filter-label">Category</span>
          <span
            className={`filter-chip${filterCat === "" ? " active" : ""}`}
            onClick={() => {
              setFilterCat("");
              setPage(1);
            }}
          >
            All
          </span>
          {state.categories.map((c) => (
            <span
              key={c.id}
              className={`filter-chip${filterCat === c.id ? " active" : ""}`}
              onClick={() => {
                setFilterCat(c.id === filterCat ? "" : c.id);
                setPage(1);
              }}
            >
              {c.icon} {c.name}
            </span>
          ))}

          <div
            style={{
              height: 18,
              width: 1,
              background: "var(--gray-200)",
              margin: "0 6px",
            }}
          />

          <span className="filter-label">Status</span>
          {["published", "draft"].map((s) => (
            <span
              key={s}
              className={`filter-chip${filterStatus === s ? " active" : ""}`}
              onClick={() => {
                setFilterStatus(filterStatus === s ? "" : s);
                setPage(1);
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}

          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-sm"
              style={{
                marginLeft: "auto",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              onClick={resetFilters}
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            {search || filterCat || filterStatus ? " matching filters" : ""}
          </span>
        </div>

        {/* Document grid / list */}
        {paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search
                size={32}
                strokeWidth={1.5}
                style={{ color: "var(--gray-300)" }}
              />
            </div>
            <div className="empty-title">No documents found</div>
            <div className="empty-text">
              Try adjusting your search or filter criteria
            </div>
            <button className="btn btn-secondary" onClick={resetFilters}>
              <X size={13} /> Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="doc-grid" data-testid="doc-grid">
            {paginated.map((doc) => {
              const Icon = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
              const iconColor =
                FILE_COLORS[doc.fileType] || FILE_COLORS.default;
              return (
                <div
                  key={doc.id}
                  className="doc-card"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  data-testid="doc-card"
                >
                  <div
                    className="doc-icon"
                    style={{
                      background: iconColor + "12",
                      borderRadius: 10,
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Icon size={20} color={iconColor} strokeWidth={1.75} />
                  </div>
                  <div className="doc-title">{doc.title}</div>
                  <div className="doc-meta">
                    {doc.fileType} · {doc.fileSize} · v{doc.currentVersion}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--gray-500)",
                      lineHeight: 1.55,
                      marginBottom: 10,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {doc.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: getCategoryColor(doc.categoryId) + "18",
                        color: getCategoryColor(doc.categoryId),
                        fontSize: 10,
                      }}
                    >
                      {getCategoryName(doc.categoryId)}
                    </span>
                    <span
                      className={`badge ${doc.status === "published" ? "badge-green" : "badge-yellow"}`}
                      style={{ fontSize: 10 }}
                    >
                      {doc.status}
                    </span>
                  </div>
                  {doc.tags?.length > 0 && (
                    <div
                      className="doc-tags"
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Tag
                        size={10}
                        style={{ color: "var(--gray-400)", flexShrink: 0 }}
                      />
                      {doc.tags.map((t) => (
                        <span key={t} className="tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((doc) => {
                    const Icon = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
                    const iconColor =
                      FILE_COLORS[doc.fileType] || FILE_COLORS.default;
                    return (
                      <tr
                        key={doc.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/documents/${doc.id}`)}
                      >
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: iconColor + "12",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Icon
                                size={16}
                                color={iconColor}
                                strokeWidth={1.75}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--gray-900)",
                                }}
                              >
                                {doc.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--gray-400)",
                                }}
                              >
                                {doc.fileSize}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              color: getCategoryColor(doc.categoryId),
                              fontWeight: 500,
                              fontSize: 12,
                            }}
                          >
                            {getCategoryName(doc.categoryId)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${doc.status === "published" ? "badge-green" : "badge-yellow"}`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{ fontFamily: "monospace", fontSize: 12 }}
                          >
                            v{doc.currentVersion}
                          </span>
                        </td>
                        <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo(0, 0);
          }}
        />
      </div>

      {showUpload && (
        <UploadModal
          categories={state.categories}
          departments={state.departments}
          currentUser={state.user}
          onClose={() => setShowUpload(false)}
          onSuccess={(doc) => {
            dispatch({ type: "ADD_DOCUMENT", payload: doc });
            setShowUpload(false);
            toast("Document uploaded successfully!");
          }}
        />
      )}
    </div>
  );
}

function UploadModal({
  categories,
  departments,
  currentUser,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    departmentId: currentUser?.departmentId || "",
    status: "draft",
    tags: "",
    fileType: "PDF",
    fileSize: "",
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // function handleFile(f) {
  //   if (!f) return;
  //   setFileName(f.name);
  //   setField("title", f.name.replace(/\.[^.]+$/, ""));
  //   setField("fileType", f.name.split(".").pop().toUpperCase() || "PDF");
  //   setField("fileSize", `${(f.size / 1024).toFixed(0)} KB`);
  // }
  const [selectedFile, setSelectedFile] = useState(null);

  // Update handleFile to store the raw File object
  function handleFile(f) {
    if (!f) return;
    setSelectedFile(f); // ← store raw File
    setFileName(f.name);
    setField("title", f.name.replace(/\.[^.]+$/, ""));
    setField("fileType", f.name.split(".").pop().toUpperCase() || "PDF");
    // fileSize display only — api.js recalculates from file.size
    setField("fileSize", `${(f.size / 1024).toFixed(0)} KB`);
  }
  // async function handleSubmit() {
  //   if (!form.title || !form.categoryId || !form.departmentId) return;
  //   setLoading(true);
  //   try {
  //     const doc = await api.createDocument({
  //       ...form,
  //       tags: form.tags
  //         ? form.tags
  //             .split(",")
  //             .map((t) => t.trim().toLowerCase())
  //             .filter(Boolean)
  //         : [],
  //       authorId: currentUser.id,
  //       currentVersion: "1.0.0",
  //       fileSize: form.fileSize || "—",
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString(),
  //     });
  //     await api.createVersion({
  //       documentId: doc.id,
  //       version: "1.0.0",
  //       authorId: currentUser.id,
  //       changelog: "Initial upload",
  //       fileSize: doc.fileSize,
  //       createdAt: new Date().toISOString(),
  //     });
  //     onSuccess(doc);
  //   } catch {
  //     alert("Upload failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  async function handleSubmit() {
    if (!form.title || !form.categoryId || !form.departmentId || !selectedFile)
      return;
    setLoading(true);
    try {
      const doc = await api.uploadDocument(
        {
          title: form.title,
          description: form.description || "",
          categoryId: form.categoryId,
          departmentId: form.departmentId,
          status: form.status,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean)
            : [],
          authorId: currentUser.id,
        },
        selectedFile, // raw File object — api.js handles presign + PUT + register
      );
      onSuccess(doc);
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  const DropIcon = FILE_ICONS[form.fileType] || FILE_ICONS.default;
  const dropIconColor = FILE_COLORS[form.fileType] || FILE_COLORS.default;

  return (
    <Modal
      title="Upload Document"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.title ||
              !form.categoryId ||
              !form.departmentId ||
              !selectedFile
            }
            data-testid="upload-submit"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload size={13} /> Upload Document
              </>
            )}
          </button>
        </>
      }
    >
      {/* Drop zone */}
      <div
        className={`dropzone${dragOver ? " active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => {
          const i = document.createElement("input");
          i.type = "file";
          i.onchange = (e) => handleFile(e.target.files[0]);
          i.click();
        }}
        style={{ marginBottom: 20 }}
      >
        <div
          className="dropzone-icon"
          style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
        >
          {fileName ? (
            <DropIcon size={28} color={dropIconColor} strokeWidth={1.5} />
          ) : (
            <FolderOpen size={28} color="var(--gray-400)" strokeWidth={1.5} />
          )}
        </div>
        {fileName ? (
          <div
            className="dropzone-text"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            {fileName}
          </div>
        ) : (
          <>
            <div className="dropzone-text">
              Drag & drop your file here, or{" "}
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                browse
              </span>
            </div>
            <div className="dropzone-hint">
              PDF, DOCX, XLSX, PPTX up to 50 MB
            </div>
          </>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Document title"
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Category</label>
          <select
            className="form-select"
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Brief description of the document…"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Department</label>
          <select
            className="form-select"
            value={form.departmentId}
            onChange={(e) => setField("departmentId", e.target.value)}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags</label>
        <div style={{ position: "relative" }}>
          <Tag
            size={13}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--gray-400)",
              pointerEvents: "none",
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: 28 }}
            value={form.tags}
            onChange={(e) => setField("tags", e.target.value)}
            placeholder="api, standards, rest (comma-separated)"
          />
        </div>
        <div className="form-hint">Separate tags with commas</div>
      </div>
    </Modal>
  );
}
