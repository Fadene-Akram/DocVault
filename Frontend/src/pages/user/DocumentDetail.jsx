import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";
import CommentsBox from "../../components/comments/CommentsBox";
import Modal from "../../components/common/Modal";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Plus,
  Star,
  FileText,
  LayoutList,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Settings,
  Clipboard,
  File,
  Palette,
  Scale,
  Tag,
} from "lucide-react";

// Maps the icon string stored in db.json → Lucide component
const CATEGORY_ICONS = {
  settings: <Settings size={24} />,
  clipboard: <Clipboard size={24} />,
  file: <File size={24} />,
  palette: <Palette size={24} />,
  scale: <Scale size={24} />,
  tag: <Tag size={24} />,
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const toast = useToast();

  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [d, v, cats, depts, users] = await Promise.all([
          api.getDocument(id),
          api.getVersions(id),
          api.getCategories(),
          api.getDepartments(),
          api.getUsers(),
        ]);
        setDoc(d);
        setVersions(
          v.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        );
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "SET_DEPARTMENTS", payload: depts });
        dispatch({ type: "SET_USERS", payload: users });
      } catch {
        toast("Failed to load document", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function getCategory() {
    return state.categories.find((c) => c.id === doc?.categoryId);
  }
  function getDepartment() {
    return state.departments.find((d) => d.id === doc?.departmentId);
  }
  function getAuthor() {
    return state.users.find((u) => u.id === doc?.authorId);
  }
  function getUserName(uid) {
    return state.users.find((u) => u.id === uid)?.name || "Unknown";
  }
  async function handleDownload(version) {
    try {
      await api.downloadDocument(doc.id);
    } catch (e) {
      toast(`Download failed: ${e.message}`, "error");
    }
  }

  if (loading)
    return (
      <div className="loading-screen" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        <span>Loading document…</span>
      </div>
    );
  if (!doc) return null;

  const cat = getCategory();
  const dept = getDepartment();
  const author = getAuthor();

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{
              padding: "5px 8px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <span style={{ color: "var(--gray-300)" }}>/</span>
          <span className="topbar-title" style={{ fontSize: 15 }}>
            {doc.title}
          </span>
        </div>
        <div className="topbar-actions">
          <span
            className={`badge ${doc.status === "published" ? "badge-green" : "badge-yellow"}`}
          >
            <span className="status-dot" />
            {doc.status}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewVersion(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} />
            New Version
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 900 }}>
        {/* Header card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
                background: cat?.color ? cat.color + "18" : "var(--gray-100)",
              }}
            >
              {CATEGORY_ICONS[cat?.icon] ?? <FileText size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--gray-900)",
                  marginBottom: 4,
                }}
              >
                {doc.title}
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--gray-500)",
                  lineHeight: 1.6,
                }}
              >
                {doc.description}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                {doc.tags?.map((t) => (
                  <span key={t} className="tag">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            {
              key: "overview",
              label: "Overview",
              icon: <LayoutList size={14} />,
            },
            {
              key: "versions",
              label: `Versions (${versions.length})`,
              icon: <Clock size={14} />,
            },
            {
              key: "comments",
              label: "Comments",
              icon: <MessageSquare size={14} />,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 20,
            }}
          >
            {/* Main metadata */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Document Metadata</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                }}
              >
                {[
                  { label: "File Type", value: doc.fileType },
                  { label: "File Size", value: doc.fileSize },
                  { label: "Current Version", value: `v${doc.currentVersion}` },
                  { label: "Total Versions", value: versions.length },
                  {
                    label: "Category",
                    value: cat ? cat.name : "—",
                    icon: cat ? CATEGORY_ICONS[cat.icon] : null,
                  },
                  { label: "Department", value: dept?.name || "—" },
                  { label: "Author", value: author?.name || "—" },
                  { label: "Status", value: doc.status },
                  {
                    label: "Created",
                    value: new Date(doc.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  {
                    label: "Last updated",
                    value: new Date(doc.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--gray-100)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--gray-400)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 3,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--gray-800)",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {icon && (
                        <span
                          style={{ color: "var(--gray-500)", display: "flex" }}
                        >
                          {/* render a smaller version of the icon */}
                          {React.cloneElement(icon, { size: 13 })}
                        </span>
                      )}
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Latest Version
                </div>
                {versions[0] && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "var(--primary-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--primary)",
                        }}
                      >
                        v{versions[0].version.split(".")[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          v{versions[0].version}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                          {new Date(versions[0].createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--gray-600)",
                        background: "var(--gray-50)",
                        padding: "6px 10px",
                        borderRadius: 6,
                      }}
                    >
                      {versions[0].changelog}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--gray-400)",
                        marginTop: 6,
                      }}
                    >
                      By {getUserName(versions[0].authorId)}
                    </div>
                  </>
                )}
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Actions
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <button
                    className="btn btn-secondary w-full"
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={() => handleDownload(versions[0])}
                  >
                    <Download size={14} />
                    Download Current
                  </button>
                  <button
                    className="btn btn-secondary w-full"
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={() => setShowNewVersion(true)}
                  >
                    <RefreshCw size={14} />
                    Create New Version
                  </button>
                  {state.user?.role === "admin" && (
                    <button
                      className="btn btn-ghost w-full"
                      style={{
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--danger)",
                      }}
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 size={14} />
                      Delete Document
                    </button>
                    //   onClick={async () => {
                    //     if (!window.confirm("Delete this document?")) return;
                    //     try {
                    //       await api.deleteDocument(doc.id);
                    //       dispatch({
                    //         type: "DELETE_DOCUMENT",
                    //         payload: doc.id,
                    //       });
                    //       toast("Document deleted");
                    //       navigate(-1);
                    //     } catch {
                    //       toast("Failed to delete document", "error");
                    //     }
                    //   }}
                    // >
                    //   <Trash2 size={14} />
                    //   Delete Document
                    // </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Versions tab */}
        {activeTab === "versions" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Version History</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewVersion(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={14} />
                New Version
              </button>
            </div>
            {versions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={32} />
                </div>
                <div className="empty-title">No versions yet</div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewVersion(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={14} />
                  Create first version
                </button>
              </div>
            ) : (
              <div className="version-timeline">
                {versions.map((v, i) => (
                  <div key={v.id} className="version-item">
                    <div
                      className="version-dot"
                      style={
                        i === 0
                          ? {
                              background: "var(--primary)",
                              color: "white",
                              borderColor: "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }
                          : {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }
                      }
                    >
                      {i === 0 ? <Star size={12} /> : i + 1}
                    </div>
                    <div className="version-content">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span className="version-number">v{v.version}</span>
                        {i === 0 && (
                          <span
                            className="badge badge-blue"
                            style={{
                              fontSize: 10,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CheckCircle size={10} />
                            Current
                          </span>
                        )}
                        {i !== 0 && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() => handleDownload(v)}
                          >
                            <Download size={11} />
                            Download
                          </button>
                        )}
                      </div>
                      <div className="version-meta">
                        By {getUserName(v.authorId)} ·{" "}
                        {new Date(v.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {v.fileSize}
                      </div>
                      <div className="version-changelog">{v.changelog}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments tab */}
        {activeTab === "comments" && (
          <div className="card">
            <CommentsBox documentId={id} />
          </div>
        )}
      </div>

      {showNewVersion && (
        <NewVersionModal
          doc={doc}
          currentUser={state.user}
          onClose={() => setShowNewVersion(false)}
          onSuccess={async (newVersion) => {
            setVersions((v) => [newVersion, ...v]);
            try {
              const updatedDoc = await api.updateDocument(doc.id, {
                currentVersion: newVersion.version,
                updatedAt: new Date().toISOString(),
              });
              setDoc(updatedDoc);
              dispatch({ type: "UPDATE_DOCUMENT", payload: updatedDoc });
            } catch {
              // Still reflect locally if API update fails
              setDoc((prev) => ({
                ...prev,
                currentVersion: newVersion.version,
                updatedAt: new Date().toISOString(),
              }));
            }
            setShowNewVersion(false);
            toast(`Version v${newVersion.version} created!`);
            setActiveTab("versions");
          }}
        />
      )}
      {showDeleteConfirm && (
        <Modal
          title="Delete Document"
          onClose={() => setShowDeleteConfirm(false)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{
                  background: "var(--danger)",
                  borderColor: "var(--danger)",
                }}
                onClick={async () => {
                  try {
                    await api.deleteDocument(doc.id);
                    dispatch({ type: "DELETE_DOCUMENT", payload: doc.id });
                    setShowDeleteConfirm(false);
                    navigate("/documents");
                  } catch {
                    setShowDeleteConfirm(false);
                    toast("Failed to delete document", "error");
                  }
                }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </>
          }
        >
          <div style={{ padding: "8px 0" }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--gray-700)",
                marginBottom: 8,
              }}
            >
              Are you sure you want to delete <strong>{doc.title}</strong>?
            </p>
            <p style={{ fontSize: 13, color: "var(--gray-500)" }}>
              This will permanently remove the document and its file from
              storage. This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function bumpVersion(current, type) {
  const parts = current.split(".").map(Number);
  if (type === "major") return `${parts[0] + 1}.0.0`;
  if (type === "minor") return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function NewVersionModal({ doc, currentUser, onClose, onSuccess }) {
  const [bumpType, setBumpType] = useState("minor");
  const [changelog, setChangelog] = useState("");
  const [loading, setLoading] = useState(false);
  const newVersion = bumpVersion(doc.currentVersion, bumpType);

  async function handleSubmit() {
    if (!changelog.trim()) return;
    setLoading(true);
    try {
      const version = await api.createVersion({
        documentId: doc.id,
        version: newVersion,
        authorId: currentUser.id,
        changelog: changelog.trim(),
        fileSize: doc.fileSize,
        createdAt: new Date().toISOString(),
      });
      onSuccess(version);
    } catch {
      alert("Failed to create version");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Create New Version"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !changelog.trim()}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{ width: 12, height: 12, borderWidth: 2 }}
                />
                Creating…
              </>
            ) : (
              <>
                <Plus size={14} />
                Create v{newVersion}
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}
        >
          Current version: <strong>v{doc.currentVersion}</strong>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Version bump type</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { type: "patch", label: "Patch", hint: "Bug fixes" },
              { type: "minor", label: "Minor", hint: "New content" },
              { type: "major", label: "Major", hint: "Major changes" },
            ].map((opt) => (
              <div
                key={opt.type}
                onClick={() => setBumpType(opt.type)}
                style={{
                  border: `2px solid ${bumpType === opt.type ? "var(--primary)" : "var(--gray-200)"}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  background:
                    bumpType === opt.type ? "var(--primary-light)" : "white",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color:
                      bumpType === opt.type
                        ? "var(--primary)"
                        : "var(--gray-800)",
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--gray-400)",
                    marginTop: 2,
                  }}
                >
                  {opt.hint}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    marginTop: 4,
                    color: "var(--gray-600)",
                  }}
                >
                  → v{bumpVersion(doc.currentVersion, opt.type)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label required">
            Changelog / Release notes
          </label>
          <textarea
            className="form-textarea"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            placeholder="Describe what changed in this version…"
            style={{ minHeight: 100 }}
            data-testid="changelog-input"
          />
        </div>
      </div>
    </Modal>
  );
}
