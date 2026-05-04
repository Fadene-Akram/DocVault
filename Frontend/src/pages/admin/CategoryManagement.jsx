// import { useState, useEffect } from "react";
// import { useApp, useToast } from "../../contexts/AppContext";
// import { api } from "../../utils/api";
// import Modal from "../../components/common/Modal";
// import {
//   FileText,
//   ClipboardList,
//   BarChart3,
//   Palette,
//   Scale,
//   Settings,
//   Folder,
//   Lock,
//   Ruler,
//   FlaskConical,
//   PenTool,
//   Briefcase,
// } from "lucide-react";

// const PRESET_COLORS = [
//   "#4F46E5",
//   "#0EA5E9",
//   "#10B981",
//   "#F59E0B",
//   "#EF4444",
//   "#8B5CF6",
//   "#EC4899",
//   "#14B8A6",
//   "#F97316",
//   "#6366F1",
// ];

// const PRESET_ICONS = [
//   { id: "file", icon: FileText },
//   { id: "clipboard", icon: ClipboardList },
//   { id: "chart", icon: BarChart3 },
//   { id: "palette", icon: Palette },
//   { id: "scale", icon: Scale },
//   { id: "settings", icon: Settings },
//   { id: "folder", icon: Folder },
//   { id: "lock", icon: Lock },
//   { id: "ruler", icon: Ruler },
//   { id: "flask", icon: FlaskConical },
//   { id: "pen", icon: PenTool },
//   { id: "briefcase", icon: Briefcase },
// ];

// export default function CategoryManagement() {
//   const { state, dispatch } = useApp();
//   const toast = useToast();
//   const [loading, setLoading] = useState(true);
//   const [showCreate, setShowCreate] = useState(false);
//   const [showEdit, setShowEdit] = useState(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const [cats, docs] = await Promise.all([
//           api.getCategories(),
//           api.getDocuments(),
//         ]);
//         dispatch({ type: "SET_CATEGORIES", payload: cats });
//         dispatch({ type: "SET_DOCUMENTS", payload: docs });
//       } catch {
//         toast("Failed to load", "error");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   function getDocCount(catId) {
//     return state.documents.filter((d) => d.categoryId === catId).length;
//   }

//   async function handleDelete(cat) {
//     const count = getDocCount(cat.id);
//     if (count > 0) {
//       toast(`Cannot delete: ${count} document(s) use this category`, "error");
//       return;
//     }
//     if (!window.confirm(`Delete category "${cat.name}"?`)) return;
//     try {
//       await api.deleteCategory(cat.id);
//       dispatch({ type: "DELETE_CATEGORY", payload: cat.id });
//       toast(`Category "${cat.name}" deleted`);
//     } catch {
//       toast("Delete failed", "error");
//     }
//   }

//   if (loading)
//     return (
//       <div className="loading-screen" style={{ minHeight: "100vh" }}>
//         <div className="spinner" />
//         <span>Loading…</span>
//       </div>
//     );

//   return (
//     <div>
//       <div className="topbar">
//         <span className="topbar-title">Categories</span>
//         <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
//           + New Category
//         </button>
//       </div>

//       <div className="page-body">
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
//             gap: 14,
//           }}
//         >
//           {state.categories.map((cat) => {
//             const count = getDocCount(cat.id);
//             return (
//               <div
//                 key={cat.id}
//                 className="card"
//                 style={{ borderTop: `3px solid ${cat.color}` }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     marginBottom: 12,
//                   }}
//                 >
//                   <div
//                     style={{ display: "flex", alignItems: "center", gap: 10 }}
//                   >
//                     <div
//                       style={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: 10,
//                         background: cat.color + "18",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: 20,
//                       }}
//                     >
//                       {cat.icon}
//                     </div>
//                     <div>
//                       <div
//                         style={{
//                           fontWeight: 700,
//                           fontSize: 14,
//                           color: "var(--gray-900)",
//                         }}
//                       >
//                         {cat.name}
//                       </div>
//                       <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
//                         {count} document{count !== 1 ? "s" : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <div style={{ display: "flex", gap: 3 }}>
//                     <button
//                       className="btn btn-ghost btn-sm"
//                       style={{ padding: "4px 8px" }}
//                       onClick={() => setShowEdit(cat)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="btn btn-ghost btn-sm"
//                       style={{
//                         padding: "4px 8px",
//                         color: count > 0 ? "var(--gray-300)" : "var(--danger)",
//                       }}
//                       onClick={() => handleDelete(cat)}
//                       disabled={count > 0}
//                       title={
//                         count > 0 ? "Remove all documents first" : "Delete"
//                       }
//                     >
//                       Del
//                     </button>
//                   </div>
//                 </div>

//                 {/* Color swatch */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                   <div
//                     style={{
//                       width: 16,
//                       height: 16,
//                       borderRadius: 4,
//                       background: cat.color,
//                       flexShrink: 0,
//                     }}
//                   />
//                   <span
//                     style={{
//                       fontSize: 11,
//                       fontFamily: "monospace",
//                       color: "var(--gray-500)",
//                     }}
//                   >
//                     {cat.color}
//                   </span>
//                 </div>

//                 {/* Usage bar */}
//                 {count > 0 && (
//                   <div style={{ marginTop: 12 }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         marginBottom: 4,
//                       }}
//                     >
//                       <span style={{ fontSize: 11, color: "var(--gray-500)" }}>
//                         Usage
//                       </span>
//                       <span style={{ fontSize: 11, color: "var(--gray-500)" }}>
//                         {count} / {state.documents.length}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         height: 4,
//                         background: "var(--gray-100)",
//                         borderRadius: 2,
//                       }}
//                     >
//                       <div
//                         style={{
//                           height: "100%",
//                           background: cat.color,
//                           borderRadius: 2,
//                           width: `${(count / Math.max(state.documents.length, 1)) * 100}%`,
//                           transition: "width 0.4s",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {state.categories.length === 0 && (
//             <div className="empty-state" style={{ gridColumn: "1/-1" }}>
//               <div className="empty-icon">🏷️</div>
//               <div className="empty-title">No categories yet</div>
//               <button
//                 className="btn btn-primary btn-sm"
//                 onClick={() => setShowCreate(true)}
//               >
//                 Create first category
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {showCreate && (
//         <CategoryFormModal
//           title="New Category"
//           onClose={() => setShowCreate(false)}
//           onSuccess={(cat) => {
//             dispatch({ type: "ADD_CATEGORY", payload: cat });
//             setShowCreate(false);
//             toast(`Category "${cat.name}" created!`);
//           }}
//         />
//       )}

//       {showEdit && (
//         <CategoryFormModal
//           title="Edit Category"
//           cat={showEdit}
//           onClose={() => setShowEdit(null)}
//           onSuccess={(cat) => {
//             dispatch({ type: "UPDATE_CATEGORY", payload: cat });
//             setShowEdit(null);
//             toast("Category updated!");
//           }}
//         />
//       )}
//     </div>
//   );
// }

// function CategoryFormModal({ title, cat, onClose, onSuccess }) {
//   const [form, setForm] = useState({
//     name: cat?.name || "",
//     color: cat?.color || PRESET_COLORS[0],
//     icon: cat?.icon || PRESET_ICONS[0],
//   });
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit() {
//     if (!form.name) return;
//     setLoading(true);
//     try {
//       const result = cat
//         ? await api.updateCategory(cat.id, form)
//         : await api.createCategory(form);
//       onSuccess(result);
//     } catch {
//       alert("Failed to save");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <Modal
//       title={title}
//       onClose={onClose}
//       footer={
//         <>
//           <button className="btn btn-secondary" onClick={onClose}>
//             Cancel
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={handleSubmit}
//             disabled={loading || !form.name}
//           >
//             {loading ? (
//               <>
//                 <span
//                   className="spinner"
//                   style={{ width: 12, height: 12, borderWidth: 2 }}
//                 />{" "}
//                 Saving…
//               </>
//             ) : (
//               "Save Category"
//             )}
//           </button>
//         </>
//       }
//     >
//       {/* Preview */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//           padding: "12px 16px",
//           background: "var(--gray-50)",
//           borderRadius: 8,
//           marginBottom: 20,
//           border: `2px solid ${form.color}`,
//         }}
//       >
//         <div
//           style={{
//             width: 44,
//             height: 44,
//             borderRadius: 12,
//             background: form.color + "22",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: 22,
//           }}
//         >
//           {form.icon}
//         </div>
//         <div>
//           <div style={{ fontWeight: 700, fontSize: 15, color: form.color }}>
//             {form.name || "Category name"}
//           </div>
//           <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Preview</div>
//         </div>
//       </div>

//       <div className="form-group">
//         <label className="form-label required">Category name</label>
//         <input
//           className="form-input"
//           value={form.name}
//           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//           placeholder="e.g. Technical"
//         />
//       </div>

//       <div className="form-group">
//         <label className="form-label">Icon</label>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//           {PRESET_ICONS.map((icon) => (
//             <button
//               key={icon}
//               onClick={() => setForm((f) => ({ ...f, icon }))}
//               style={{
//                 width: 38,
//                 height: 38,
//                 borderRadius: 8,
//                 fontSize: 18,
//                 cursor: "pointer",
//                 border: `2px solid ${form.icon === icon ? form.color : "var(--gray-200)"}`,
//                 background: form.icon === icon ? form.color + "18" : "white",
//                 transition: "all 0.15s",
//               }}
//             >
//               {icon}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="form-group">
//         <label className="form-label">Color</label>
//         <div
//           style={{
//             display: "flex",
//             gap: 8,
//             flexWrap: "wrap",
//             alignItems: "center",
//           }}
//         >
//           {PRESET_COLORS.map((color) => (
//             <button
//               key={color}
//               onClick={() => setForm((f) => ({ ...f, color }))}
//               style={{
//                 width: 28,
//                 height: 28,
//                 borderRadius: 6,
//                 background: color,
//                 cursor: "pointer",
//                 border: `3px solid ${form.color === color ? "var(--gray-800)" : "transparent"}`,
//                 transition: "all 0.15s",
//               }}
//             />
//           ))}
//           <input
//             type="color"
//             value={form.color}
//             onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
//             style={{
//               width: 36,
//               height: 28,
//               borderRadius: 6,
//               border: "1px solid var(--gray-300)",
//               padding: 2,
//               cursor: "pointer",
//             }}
//           />
//         </div>
//         <div className="form-hint">Or pick a custom color</div>
//       </div>
//     </Modal>
//   );
// }
import { useState, useEffect } from "react";
import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";
import Modal from "../../components/common/Modal";
import {
  FileText,
  ClipboardList,
  BarChart3,
  Palette,
  Scale,
  Settings,
  Folder,
  Lock,
  Ruler,
  FlaskConical,
  PenTool,
  Briefcase,
  Tags,
} from "lucide-react";

/* ===================== PRESETS ===================== */

const PRESET_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

const PRESET_ICONS = [
  { id: "file", icon: FileText },
  { id: "clipboard", icon: ClipboardList },
  { id: "chart", icon: BarChart3 },
  { id: "palette", icon: Palette },
  { id: "scale", icon: Scale },
  { id: "settings", icon: Settings },
  { id: "folder", icon: Folder },
  { id: "lock", icon: Lock },
  { id: "ruler", icon: Ruler },
  { id: "flask", icon: FlaskConical },
  { id: "pen", icon: PenTool },
  { id: "briefcase", icon: Briefcase },
];

const ICON_MAP = Object.fromEntries(
  PRESET_ICONS.map(({ id, icon }) => [id, icon]),
);

/* ===================== MAIN ===================== */

export default function CategoryManagement() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cats, docs] = await Promise.all([
          api.getCategories(),
          api.getDocuments(),
        ]);
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "SET_DOCUMENTS", payload: docs });
      } catch {
        toast("Failed to load", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getDocCount(catId) {
    return state.documents.filter((d) => d.categoryId === catId).length;
  }

  async function handleDelete(cat) {
    const count = getDocCount(cat.id);
    if (count > 0) {
      toast(`Cannot delete: ${count} document(s) use this category`, "error");
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.deleteCategory(cat.id);
      dispatch({ type: "DELETE_CATEGORY", payload: cat.id });
      toast(`Category "${cat.name}" deleted`);
    } catch {
      toast("Delete failed", "error");
    }
  }

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Categories</span>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Category
        </button>
      </div>

      <div className="page-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {state.categories.map((cat) => {
            const count = getDocCount(cat.id);
            const Icon = ICON_MAP[cat.icon] || FileText;

            return (
              <div
                key={cat.id}
                className="card"
                style={{ borderTop: `3px solid ${cat.color}` }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: cat.color + "18",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                        {count} document{count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 3 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{
                        color: count > 0 ? "var(--gray-300)" : "var(--danger)",
                      }}
                      disabled={count > 0}
                      onClick={() => handleDelete(cat)}
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {state.categories.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <Tags size={32} />
              <div className="empty-title">No categories yet</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreate(true)}
              >
                Create first category
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CategoryFormModal
          title="New Category"
          onClose={() => setShowCreate(false)}
          onSuccess={(cat) => {
            dispatch({ type: "ADD_CATEGORY", payload: cat });
            setShowCreate(false);
            toast(`Category "${cat.name}" created!`);
          }}
        />
      )}

      {showEdit && (
        <CategoryFormModal
          title="Edit Category"
          cat={showEdit}
          onClose={() => setShowEdit(null)}
          onSuccess={(cat) => {
            dispatch({ type: "UPDATE_CATEGORY", payload: cat });
            setShowEdit(null);
            toast("Category updated!");
          }}
        />
      )}
    </div>
  );
}

/* ===================== MODAL ===================== */

function CategoryFormModal({ title, cat, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: cat?.name || "",
    color: cat?.color || PRESET_COLORS[0],
    icon: cat?.icon || PRESET_ICONS[0].id,
  });
  const [loading, setLoading] = useState(false);

  const PreviewIcon = ICON_MAP[form.icon] || FileText;

  async function handleSubmit() {
    if (!form.name) return;
    setLoading(true);
    try {
      const result = cat
        ? await api.updateCategory(cat.id, form)
        : await api.createCategory(form);
      onSuccess(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!form.name || loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving…" : "Save Category"}
          </button>
        </>
      }
    >
      {/* Preview */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          background: "var(--gray-50)",
          borderRadius: 8,
          border: `2px solid ${form.color}`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: form.color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PreviewIcon size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{form.name || "Category name"}</div>
          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Preview</div>
        </div>
      </div>

      {/* Name */}
      <div className="form-group">
        <label className="form-label required">Category name</label>
        <input
          className="form-input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Icon picker */}
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PRESET_ICONS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setForm((f) => ({ ...f, icon: id }))}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: `2px solid ${
                  form.icon === id ? form.color : "var(--gray-200)"
                }`,
                background: form.icon === id ? form.color + "18" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="form-group">
        <label className="form-label">Color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setForm((f) => ({ ...f, color }))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: color,
                border:
                  form.color === color
                    ? "3px solid var(--gray-800)"
                    : "3px solid transparent",
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
