// import { useState, useEffect, useMemo } from "react";
// import { useApp, useToast } from "../../contexts/AppContext";
// import { api } from "../../utils/api";
// import Pagination from "../../components/common/Pagination";
// import Modal from "../../components/common/Modal";
// import Papa from "papaparse";

// const PAGE_SIZE = 8;

// export default function UsersManagement() {
//   const { state, dispatch } = useApp();
//   const toast = useToast();

//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterRole, setFilterRole] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [filterDept, setFilterDept] = useState("");
//   const [page, setPage] = useState(1);
//   const [selected, setSelected] = useState([]);
//   const [showCreate, setShowCreate] = useState(false);
//   const [showEdit, setShowEdit] = useState(null);
//   const [showImport, setShowImport] = useState(false);

//   useEffect(() => {
//     async function load() {
//       try {
//         const [users, depts] = await Promise.all([
//           api.getUsers(),
//           api.getDepartments(),
//         ]);
//         dispatch({ type: "SET_USERS", payload: users });
//         dispatch({ type: "SET_DEPARTMENTS", payload: depts });
//       } catch {
//         toast("Failed to load users", "error");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   const filtered = useMemo(() => {
//     let users = state.users;
//     if (search) {
//       const q = search.toLowerCase();
//       users = users.filter(
//         (u) =>
//           u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
//       );
//     }
//     if (filterRole) users = users.filter((u) => u.role === filterRole);
//     if (filterStatus) users = users.filter((u) => u.status === filterStatus);
//     if (filterDept) users = users.filter((u) => u.departmentId === filterDept);
//     return users;
//   }, [state.users, search, filterRole, filterStatus, filterDept]);

//   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   function getDeptName(id) {
//     return state.departments.find((d) => d.id === id)?.name || "—";
//   }

//   function toggleSelect(id) {
//     setSelected((s) =>
//       s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
//     );
//   }
//   function toggleAll() {
//     const ids = paginated.map((u) => u.id);
//     const allSelected = ids.every((id) => selected.includes(id));
//     setSelected((s) =>
//       allSelected
//         ? s.filter((id) => !ids.includes(id))
//         : [...new Set([...s, ...ids])],
//     );
//   }

//   async function bulkSuspend() {
//     if (!window.confirm(`Suspend ${selected.length} user(s)?`)) return;
//     try {
//       await Promise.all(
//         selected.map((id) => api.updateUser(id, { status: "suspended" })),
//       );
//       dispatch({
//         type: "BULK_UPDATE_USERS",
//         payload: { ids: selected, data: { status: "suspended" } },
//       });
//       toast(`${selected.length} user(s) suspended`);
//       setSelected([]);
//     } catch {
//       toast("Bulk suspend failed", "error");
//     }
//   }

//   async function bulkActivate() {
//     try {
//       await Promise.all(
//         selected.map((id) => api.updateUser(id, { status: "active" })),
//       );
//       dispatch({
//         type: "BULK_UPDATE_USERS",
//         payload: { ids: selected, data: { status: "active" } },
//       });
//       toast(`${selected.length} user(s) activated`);
//       setSelected([]);
//     } catch {
//       toast("Bulk activate failed", "error");
//     }
//   }

//   function exportCSV() {
//     const data = (
//       selected.length > 0
//         ? state.users.filter((u) => selected.includes(u.id))
//         : filtered
//     ).map((u) => ({
//       name: u.name,
//       email: u.email,
//       role: u.role,
//       status: u.status,
//       department: getDeptName(u.departmentId),
//       createdAt: new Date(u.createdAt).toLocaleDateString(),
//     }));
//     const csv = Papa.unparse(data);
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "users-export.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//     toast(`Exported ${data.length} users to CSV`);
//   }

//   const stats = {
//     total: state.users.length,
//     active: state.users.filter((u) => u.status === "active").length,
//     suspended: state.users.filter((u) => u.status === "suspended").length,
//     admins: state.users.filter((u) => u.role === "admin").length,
//   };

//   if (loading)
//     return (
//       <div className="loading-screen" style={{ minHeight: "100vh" }}>
//         <div className="spinner" />
//         <span>Loading users…</span>
//       </div>
//     );

//   return (
//     <div>
//       <div className="topbar">
//         <span className="topbar-title">Users</span>
//         <div className="topbar-actions">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setShowImport(true)}
//           >
//             ⬆️ Import CSV
//           </button>
//           <button className="btn btn-secondary" onClick={exportCSV}>
//             ⬇️ Export
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={() => setShowCreate(true)}
//             data-testid="create-user-btn"
//           >
//             + Add User
//           </button>
//         </div>
//       </div>

//       <div className="page-body">
//         {/* Stats */}
//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-value">{stats.total}</div>
//             <div className="stat-label">Total Users</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value" style={{ color: "var(--success)" }}>
//               {stats.active}
//             </div>
//             <div className="stat-label">Active</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value" style={{ color: "var(--danger)" }}>
//               {stats.suspended}
//             </div>
//             <div className="stat-label">Suspended</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value" style={{ color: "var(--primary)" }}>
//               {stats.admins}
//             </div>
//             <div className="stat-label">Admins</div>
//           </div>
//         </div>

//         {/* Search + Filters */}
//         <div
//           style={{
//             display: "flex",
//             gap: 10,
//             marginBottom: 14,
//             alignItems: "center",
//           }}
//         >
//           <div className="search-bar" style={{ flex: 1 }}>
//             <span className="search-icon">🔍</span>
//             <input
//               placeholder="Search by name or email…"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               data-testid="user-search"
//             />
//             {search && (
//               <button
//                 onClick={() => setSearch("")}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   color: "var(--gray-400)",
//                   fontSize: 16,
//                 }}
//               >
//                 ×
//               </button>
//             )}
//           </div>
//           <select
//             className="form-select"
//             style={{ width: 130 }}
//             value={filterRole}
//             onChange={(e) => {
//               setFilterRole(e.target.value);
//               setPage(1);
//             }}
//           >
//             <option value="">All roles</option>
//             <option value="admin">Admin</option>
//             <option value="user">User</option>
//           </select>
//           <select
//             className="form-select"
//             style={{ width: 140 }}
//             value={filterStatus}
//             onChange={(e) => {
//               setFilterStatus(e.target.value);
//               setPage(1);
//             }}
//           >
//             <option value="">All statuses</option>
//             <option value="active">Active</option>
//             <option value="suspended">Suspended</option>
//           </select>
//           <select
//             className="form-select"
//             style={{ width: 160 }}
//             value={filterDept}
//             onChange={(e) => {
//               setFilterDept(e.target.value);
//               setPage(1);
//             }}
//           >
//             <option value="">All departments</option>
//             {state.departments.map((d) => (
//               <option key={d.id} value={d.id}>
//                 {d.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Multi-select action bar */}
//         {selected.length > 0 && (
//           <div className="action-bar">
//             <span className="action-bar-count">
//               {selected.length} user{selected.length !== 1 ? "s" : ""} selected
//             </span>
//             <button className="btn btn-secondary btn-sm" onClick={bulkActivate}>
//               ✅ Activate
//             </button>
//             <button
//               className="btn btn-secondary btn-sm"
//               style={{ color: "var(--warning)" }}
//               onClick={bulkSuspend}
//             >
//               ⛔ Suspend
//             </button>
//             <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
//               ⬇️ Export Selected
//             </button>
//             <button
//               className="btn btn-ghost btn-sm"
//               onClick={() => setSelected([])}
//             >
//               Clear
//             </button>
//           </div>
//         )}

//         {/* Table */}
//         <div className="card" style={{ padding: 0 }}>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th className="checkbox-cell">
//                     <input
//                       type="checkbox"
//                       checked={
//                         paginated.length > 0 &&
//                         paginated.every((u) => selected.includes(u.id))
//                       }
//                       onChange={toggleAll}
//                       title="Select all on this page"
//                     />
//                   </th>
//                   <th>User</th>
//                   <th>Role</th>
//                   <th>Department</th>
//                   <th>Status</th>
//                   <th>Joined</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginated.length === 0 ? (
//                   <tr>
//                     <td colSpan={7}>
//                       <div className="empty-state">
//                         <div className="empty-icon">👤</div>
//                         <div className="empty-title">No users found</div>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   paginated.map((user) => (
//                     <tr
//                       key={user.id}
//                       style={{
//                         background: selected.includes(user.id)
//                           ? "var(--primary-light)"
//                           : undefined,
//                       }}
//                     >
//                       <td className="checkbox-cell">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(user.id)}
//                           onChange={() => toggleSelect(user.id)}
//                         />
//                       </td>
//                       <td>
//                         <div
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 10,
//                           }}
//                         >
//                           <div
//                             className="avatar"
//                             style={{ width: 34, height: 34, fontSize: 11 }}
//                           >
//                             {user.avatar || user.name.slice(0, 2).toUpperCase()}
//                           </div>
//                           <div>
//                             <div
//                               style={{
//                                 fontWeight: 600,
//                                 color: "var(--gray-900)",
//                               }}
//                             >
//                               {user.name}
//                             </div>
//                             <div
//                               style={{ fontSize: 11, color: "var(--gray-400)" }}
//                             >
//                               {user.email}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <span
//                           className={`badge ${user.role === "admin" ? "badge-purple" : "badge-blue"}`}
//                         >
//                           {user.role === "admin" ? "🛡️" : "👤"} {user.role}
//                         </span>
//                       </td>
//                       <td>{getDeptName(user.departmentId)}</td>
//                       <td>
//                         <span
//                           className={`badge ${user.status === "active" ? "badge-green" : "badge-red"}`}
//                         >
//                           <span className="status-dot" />
//                           {user.status}
//                         </span>
//                       </td>
//                       <td>{new Date(user.createdAt).toLocaleDateString()}</td>
//                       <td>
//                         <div style={{ display: "flex", gap: 4 }}>
//                           <button
//                             className="btn btn-ghost btn-sm"
//                             style={{ padding: "4px 8px", fontSize: 12 }}
//                             onClick={() => setShowEdit(user)}
//                           >
//                             Edit
//                           </button>
//                           <button
//                             className="btn btn-ghost btn-sm"
//                             style={{
//                               padding: "4px 8px",
//                               fontSize: 12,
//                               color:
//                                 user.status === "active"
//                                   ? "var(--warning)"
//                                   : "var(--success)",
//                             }}
//                             onClick={async () => {
//                               const newStatus =
//                                 user.status === "active"
//                                   ? "suspended"
//                                   : "active";
//                               const updated = await api.updateUser(user.id, {
//                                 status: newStatus,
//                               });
//                               dispatch({
//                                 type: "UPDATE_USER",
//                                 payload: updated,
//                               });
//                               toast(
//                                 `${user.name} ${newStatus === "suspended" ? "suspended" : "activated"}`,
//                               );
//                             }}
//                           >
//                             {user.status === "active" ? "Suspend" : "Activate"}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <div style={{ padding: "0 16px" }}>
//             <Pagination
//               page={page}
//               totalPages={totalPages}
//               totalItems={filtered.length}
//               pageSize={PAGE_SIZE}
//               onPageChange={(p) => {
//                 setPage(p);
//                 setSelected([]);
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {showCreate && (
//         <UserFormModal
//           title="Add New User"
//           departments={state.departments}
//           onClose={() => setShowCreate(false)}
//           onSuccess={(user) => {
//             dispatch({ type: "ADD_USER", payload: user });
//             setShowCreate(false);
//             toast(`${user.name} added successfully!`);
//           }}
//         />
//       )}

//       {showEdit && (
//         <UserFormModal
//           title="Edit User"
//           user={showEdit}
//           departments={state.departments}
//           onClose={() => setShowEdit(null)}
//           onSuccess={(user) => {
//             dispatch({ type: "UPDATE_USER", payload: user });
//             setShowEdit(null);
//             toast(`${user.name} updated!`);
//           }}
//         />
//       )}

//       {showImport && (
//         <CSVImportWizard
//           departments={state.departments}
//           onClose={() => setShowImport(false)}
//           onSuccess={(users) => {
//             users.forEach((u) => dispatch({ type: "ADD_USER", payload: u }));
//             setShowImport(false);
//             toast(`${users.length} users imported successfully!`);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// /* ---- User Form Modal ---- */
// function UserFormModal({ title, user, departments, onClose, onSuccess }) {
//   const [form, setForm] = useState({
//     name: user?.name || "",
//     email: user?.email || "",
//     password: user?.password || "",
//     role: user?.role || "user",
//     departmentId: user?.departmentId || "",
//     status: user?.status || "active",
//   });
//   const [loading, setLoading] = useState(false);

//   function setField(k, v) {
//     setForm((f) => ({ ...f, [k]: v }));
//   }

//   async function handleSubmit() {
//     if (!form.name || !form.email || !form.password) return;
//     setLoading(true);
//     try {
//       let result;
//       if (user) {
//         result = await api.updateUser(user.id, form);
//       } else {
//         result = await api.createUser({
//           ...form,
//           avatar: form.name
//             .split(" ")
//             .map((w) => w[0])
//             .join("")
//             .toUpperCase()
//             .slice(0, 2),
//           createdAt: new Date().toISOString(),
//         });
//       }
//       onSuccess(result);
//     } catch {
//       alert("Failed to save user");
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
//             disabled={loading || !form.name || !form.email || !form.password}
//             data-testid="save-user-btn"
//           >
//             {loading ? (
//               <>
//                 <span
//                   className="spinner"
//                   style={{ width: 12, height: 12, borderWidth: 2 }}
//                 />{" "}
//                 Saving…
//               </>
//             ) : user ? (
//               "Save Changes"
//             ) : (
//               "Create User"
//             )}
//           </button>
//         </>
//       }
//     >
//       <div className="form-row">
//         <div className="form-group">
//           <label className="form-label required">Full name</label>
//           <input
//             className="form-input"
//             value={form.name}
//             onChange={(e) => setField("name", e.target.value)}
//             placeholder="Jane Doe"
//             data-testid="user-name-input"
//           />
//         </div>
//         <div className="form-group">
//           <label className="form-label required">Email</label>
//           <input
//             className="form-input"
//             type="email"
//             value={form.email}
//             onChange={(e) => setField("email", e.target.value)}
//             placeholder="jane@company.com"
//           />
//         </div>
//       </div>
//       <div className="form-group">
//         <label className="form-label required">Password</label>
//         <input
//           className="form-input"
//           type="password"
//           value={form.password}
//           onChange={(e) => setField("password", e.target.value)}
//           placeholder="••••••••"
//         />
//       </div>
//       <div className="form-row">
//         <div className="form-group">
//           <label className="form-label">Role</label>
//           <select
//             className="form-select"
//             value={form.role}
//             onChange={(e) => setField("role", e.target.value)}
//           >
//             <option value="user">👤 User</option>
//             <option value="admin">🛡️ Admin</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <label className="form-label">Department</label>
//           <select
//             className="form-select"
//             value={form.departmentId}
//             onChange={(e) => setField("departmentId", e.target.value)}
//           >
//             <option value="">No department</option>
//             {departments.map((d) => (
//               <option key={d.id} value={d.id}>
//                 {d.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//       <div className="form-group">
//         <label className="form-label">Status</label>
//         <select
//           className="form-select"
//           value={form.status}
//           onChange={(e) => setField("status", e.target.value)}
//         >
//           <option value="active">✅ Active</option>
//           <option value="suspended">⛔ Suspended</option>
//         </select>
//       </div>
//     </Modal>
//   );
// }

// /* ---- CSV Import Wizard ---- */
// function CSVImportWizard({ departments, onClose, onSuccess }) {
//   const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: done
//   const [rows, setRows] = useState([]);
//   const [errors, setErrors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fileName, setFileName] = useState("");

//   const REQUIRED_COLS = ["name", "email", "password"];
//   const SAMPLE_CSV = `name,email,password,role,department\nJohn Smith,john@company.com,pass123,user,Engineering\nSarah Lee,sarah@company.com,pass456,user,Marketing`;

//   function handleFile(file) {
//     if (!file) return;
//     setFileName(file.name);
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: ({ data }) => {
//         const errs = [];
//         const headers = Object.keys(data[0] || {}).map((h) =>
//           h.toLowerCase().trim(),
//         );
//         REQUIRED_COLS.forEach((col) => {
//           if (!headers.includes(col))
//             errs.push(`Missing required column: "${col}"`);
//         });
//         const normalized = data.map((row, i) => {
//           const r = {};
//           Object.keys(row).forEach((k) => {
//             r[k.toLowerCase().trim()] = row[k];
//           });
//           if (!r.name) errs.push(`Row ${i + 2}: missing name`);
//           if (!r.email || !r.email.includes("@"))
//             errs.push(`Row ${i + 2}: invalid email`);
//           const dept = departments.find(
//             (d) => d.name.toLowerCase() === (r.department || "").toLowerCase(),
//           );
//           return {
//             name: r.name || "",
//             email: r.email || "",
//             password: r.password || "changeme",
//             role: r.role === "admin" ? "admin" : "user",
//             departmentId: dept?.id || "",
//             status: "active",
//             avatar: (r.name || "??")
//               .split(" ")
//               .map((w) => w[0])
//               .join("")
//               .toUpperCase()
//               .slice(0, 2),
//             createdAt: new Date().toISOString(),
//           };
//         });
//         setErrors(errs);
//         setRows(normalized);
//         setStep(2);
//       },
//     });
//   }

//   async function handleImport() {
//     setLoading(true);
//     try {
//       const created = await Promise.all(rows.map((row) => api.createUser(row)));
//       setStep(3);
//       setTimeout(() => onSuccess(created), 800);
//     } catch {
//       alert("Import failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function downloadSample() {
//     const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = "sample-users.csv";
//     a.click();
//   }

//   return (
//     <Modal
//       title="Import Users from CSV"
//       onClose={onClose}
//       size="lg"
//       footer={
//         step === 2 ? (
//           <>
//             <button className="btn btn-secondary" onClick={() => setStep(1)}>
//               ← Back
//             </button>
//             <button
//               className="btn btn-primary"
//               onClick={handleImport}
//               disabled={loading || rows.length === 0 || errors.length > 0}
//             >
//               {loading ? (
//                 <>
//                   <span
//                     className="spinner"
//                     style={{ width: 12, height: 12, borderWidth: 2 }}
//                   />{" "}
//                   Importing…
//                 </>
//               ) : (
//                 `Import ${rows.length} users`
//               )}
//             </button>
//           </>
//         ) : step === 1 ? (
//           <button className="btn btn-secondary" onClick={onClose}>
//             Cancel
//           </button>
//         ) : null
//       }
//     >
//       {/* Wizard steps */}
//       <div className="wizard-steps">
//         {["Upload", "Preview", "Done"].map((label, i) => {
//           const num = i + 1;
//           const cls = step > num ? "done" : step === num ? "active" : "";
//           return (
//             <div
//               key={label}
//               style={{ display: "flex", alignItems: "center", flex: 1 }}
//             >
//               <div className={`wizard-step ${cls}`} style={{ flex: 1 }}>
//                 <div className="wizard-step-num">{step > num ? "✓" : num}</div>
//                 <span className="wizard-step-label">{label}</span>
//               </div>
//               {i < 2 && (
//                 <div
//                   className={`wizard-connector${step > num ? " done" : ""}`}
//                 />
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {step === 1 && (
//         <>
//           <div
//             className="dropzone"
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={(e) => {
//               e.preventDefault();
//               handleFile(e.dataTransfer.files[0]);
//             }}
//             onClick={() => {
//               const inp = document.createElement("input");
//               inp.type = "file";
//               inp.accept = ".csv";
//               inp.onchange = (e) => handleFile(e.target.files[0]);
//               inp.click();
//             }}
//           >
//             <div className="dropzone-icon">📊</div>
//             <div className="dropzone-text">
//               Drag your CSV file here, or{" "}
//               <span style={{ color: "var(--primary)", fontWeight: 600 }}>
//                 browse
//               </span>
//             </div>
//             <div className="dropzone-hint">
//               Must include columns: name, email, password
//             </div>
//           </div>
//           <div
//             style={{
//               marginTop: 14,
//               padding: "12px 14px",
//               background: "var(--gray-50)",
//               borderRadius: 8,
//               border: "1px solid var(--gray-200)",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: "var(--gray-600)",
//                 marginBottom: 6,
//               }}
//             >
//               CSV Format
//             </div>
//             <code
//               style={{
//                 fontSize: 11,
//                 color: "var(--gray-600)",
//                 display: "block",
//                 lineHeight: 1.8,
//               }}
//             >
//               name, email, password, role, department
//               <br />
//               John Smith, john@co.com, pass123, user, Engineering
//             </code>
//             <button
//               className="btn btn-ghost btn-sm"
//               style={{ marginTop: 8, fontSize: 12 }}
//               onClick={downloadSample}
//             >
//               ⬇️ Download sample CSV
//             </button>
//           </div>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           {errors.length > 0 && (
//             <div className="alert alert-danger">
//               <div>
//                 <strong>
//                   ⚠️ {errors.length} validation error
//                   {errors.length !== 1 ? "s" : ""} found:
//                 </strong>
//                 <ul style={{ marginTop: 6, paddingLeft: 16 }}>
//                   {errors.map((e, i) => (
//                     <li key={i} style={{ fontSize: 12, marginTop: 2 }}>
//                       {e}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}
//           <div
//             style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 12 }}
//           >
//             <strong style={{ color: "var(--gray-900)" }}>
//               {rows.length} users
//             </strong>{" "}
//             ready to import from <strong>{fileName}</strong>
//           </div>
//           <div
//             className="table-wrap"
//             style={{
//               maxHeight: 300,
//               overflowY: "auto",
//               border: "1px solid var(--gray-200)",
//               borderRadius: 8,
//             }}
//           >
//             <table>
//               <thead>
//                 <tr>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Role</th>
//                   <th>Department</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((r, i) => (
//                   <tr key={i}>
//                     <td>{r.name}</td>
//                     <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
//                       {r.email}
//                     </td>
//                     <td>
//                       <span
//                         className={`badge ${r.role === "admin" ? "badge-purple" : "badge-blue"}`}
//                       >
//                         {r.role}
//                       </span>
//                     </td>
//                     <td>
//                       {departments.find((d) => d.id === r.departmentId)
//                         ?.name || (
//                         <span style={{ color: "var(--gray-400)" }}>—</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {step === 3 && (
//         <div style={{ textAlign: "center", padding: "32px 0" }}>
//           <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
//           <div
//             style={{
//               fontSize: 17,
//               fontWeight: 700,
//               color: "var(--gray-900)",
//               marginBottom: 6,
//             }}
//           >
//             Import complete!
//           </div>
//           <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
//             {rows.length} users added successfully
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// }
import { useState, useEffect, useMemo } from "react";
import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import Papa from "papaparse";
import {
  Upload,
  Download,
  Plus,
  Search,
  X,
  CheckCircle,
  Ban,
  Shield,
  User,
  FileSpreadsheet,
  ArrowLeft,
  PartyPopper,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const PAGE_SIZE = 8;

export default function UsersManagement() {
  const { state, dispatch } = useApp();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [users, depts] = await Promise.all([
          api.getUsers(),
          api.getDepartments(),
        ]);
        dispatch({ type: "SET_USERS", payload: users });
        dispatch({ type: "SET_DEPARTMENTS", payload: depts });
      } catch {
        toast("Failed to load users", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let users = state.users;
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (filterRole) users = users.filter((u) => u.role === filterRole);
    if (filterStatus) users = users.filter((u) => u.status === filterStatus);
    if (filterDept) users = users.filter((u) => u.departmentId === filterDept);
    return users;
  }, [state.users, search, filterRole, filterStatus, filterDept]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getDeptName(id) {
    return state.departments.find((d) => d.id === id)?.name || "—";
  }

  function toggleSelect(id) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }
  function toggleAll() {
    const ids = paginated.map((u) => u.id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected((s) =>
      allSelected
        ? s.filter((id) => !ids.includes(id))
        : [...new Set([...s, ...ids])],
    );
  }

  async function bulkSuspend() {
    if (!window.confirm(`Suspend ${selected.length} user(s)?`)) return;
    try {
      await Promise.all(
        selected.map((id) => api.updateUser(id, { status: "suspended" })),
      );
      dispatch({
        type: "BULK_UPDATE_USERS",
        payload: { ids: selected, data: { status: "suspended" } },
      });
      toast(`${selected.length} user(s) suspended`);
      setSelected([]);
    } catch {
      toast("Bulk suspend failed", "error");
    }
  }

  async function bulkActivate() {
    try {
      await Promise.all(
        selected.map((id) => api.updateUser(id, { status: "active" })),
      );
      dispatch({
        type: "BULK_UPDATE_USERS",
        payload: { ids: selected, data: { status: "active" } },
      });
      toast(`${selected.length} user(s) activated`);
      setSelected([]);
    } catch {
      toast("Bulk activate failed", "error");
    }
  }

  function exportCSV() {
    const data = (
      selected.length > 0
        ? state.users.filter((u) => selected.includes(u.id))
        : filtered
    ).map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      department: getDeptName(u.departmentId),
      createdAt: new Date(u.createdAt).toLocaleDateString(),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${data.length} users to CSV`);
  }

  const stats = {
    total: state.users.length,
    active: state.users.filter((u) => u.status === "active").length,
    suspended: state.users.filter((u) => u.status === "suspended").length,
    admins: state.users.filter((u) => u.role === "admin").length,
  };

  if (loading)
    return (
      <div className="loading-screen" style={{ minHeight: "100vh" }}>
        <Loader2 size={24} className="spin" />
        <span>Loading users…</span>
      </div>
    );

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Users</span>
        <div className="topbar-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowImport(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Upload size={14} />
            Import CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            data-testid="create-user-btn"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} />
            Add User
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {stats.active}
            </div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--danger)" }}>
              {stats.suspended}
            </div>
            <div className="stat-label">Suspended</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--primary)" }}>
              {stats.admins}
            </div>
            <div className="stat-label">Admins</div>
          </div>
        </div>

        {/* Search + Filters */}
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
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              data-testid="user-search"
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
          <select
            className="form-select"
            style={{ width: 130 }}
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            className="form-select"
            style={{ width: 160 }}
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All departments</option>
            {state.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-select action bar */}
        {selected.length > 0 && (
          <div className="action-bar">
            <span className="action-bar-count">
              {selected.length} user{selected.length !== 1 ? "s" : ""} selected
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={bulkActivate}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <CheckCircle size={13} />
              Activate
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: "var(--warning)", display: "flex", alignItems: "center", gap: 5 }}
              onClick={bulkSuspend}
            >
              <Ban size={13} />
              Suspend
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={exportCSV}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Download size={13} />
              Export Selected
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={
                        paginated.length > 0 &&
                        paginated.every((u) => selected.includes(u.id))
                      }
                      onChange={toggleAll}
                      title="Select all on this page"
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon">
                          <User size={32} strokeWidth={1.5} style={{ color: "var(--gray-300)" }} />
                        </div>
                        <div className="empty-title">No users found</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        background: selected.includes(user.id)
                          ? "var(--primary-light)"
                          : undefined,
                      }}
                    >
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selected.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                        />
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            className="avatar"
                            style={{ width: 34, height: 34, fontSize: 11 }}
                          >
                            {user.avatar || user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--gray-900)",
                              }}
                            >
                              {user.name}
                            </div>
                            <div
                              style={{ fontSize: 11, color: "var(--gray-400)" }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${user.role === "admin" ? "badge-purple" : "badge-blue"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          {user.role === "admin"
                            ? <Shield size={11} />
                            : <User size={11} />}
                          {user.role}
                        </span>
                      </td>
                      <td>{getDeptName(user.departmentId)}</td>
                      <td>
                        <span
                          className={`badge ${user.status === "active" ? "badge-green" : "badge-red"}`}
                        >
                          <span className="status-dot" />
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px 8px", fontSize: 12 }}
                            onClick={() => setShowEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: "4px 8px",
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color:
                                user.status === "active"
                                  ? "var(--warning)"
                                  : "var(--success)",
                            }}
                            onClick={async () => {
                              const newStatus =
                                user.status === "active"
                                  ? "suspended"
                                  : "active";
                              const updated = await api.updateUser(user.id, {
                                status: newStatus,
                              });
                              dispatch({
                                type: "UPDATE_USER",
                                payload: updated,
                              });
                              toast(
                                `${user.name} ${newStatus === "suspended" ? "suspended" : "activated"}`,
                              );
                            }}
                          >
                            {user.status === "active"
                              ? <><Ban size={12} /> Suspend</>
                              : <><CheckCircle size={12} /> Activate</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "0 16px" }}>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => {
                setPage(p);
                setSelected([]);
              }}
            />
          </div>
        </div>
      </div>

      {showCreate && (
        <UserFormModal
          title="Add New User"
          departments={state.departments}
          onClose={() => setShowCreate(false)}
          onSuccess={(user) => {
            dispatch({ type: "ADD_USER", payload: user });
            setShowCreate(false);
            toast(`${user.name} added successfully!`);
          }}
        />
      )}

      {showEdit && (
        <UserFormModal
          title="Edit User"
          user={showEdit}
          departments={state.departments}
          onClose={() => setShowEdit(null)}
          onSuccess={(user) => {
            dispatch({ type: "UPDATE_USER", payload: user });
            setShowEdit(null);
            toast(`${user.name} updated!`);
          }}
        />
      )}

      {showImport && (
        <CSVImportWizard
          departments={state.departments}
          onClose={() => setShowImport(false)}
          onSuccess={(users) => {
            users.forEach((u) => dispatch({ type: "ADD_USER", payload: u }));
            setShowImport(false);
            toast(`${users.length} users imported successfully!`);
          }}
        />
      )}
    </div>
  );
}

/* ---- User Form Modal ---- */
function UserFormModal({ title, user, departments, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: user?.password || "",
    role: user?.role || "user",
    departmentId: user?.departmentId || "",
    status: user?.status || "active",
  });
  const [loading, setLoading] = useState(false);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    try {
      let result;
      if (user) {
        result = await api.updateUser(user.id, form);
      } else {
        result = await api.createUser({
          ...form,
          avatar: form.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          createdAt: new Date().toISOString(),
        });
      }
      onSuccess(result);
    } catch {
      alert("Failed to save user");
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
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email || !form.password}
            data-testid="save-user-btn"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="spin" />
                Saving…
              </>
            ) : user ? (
              "Save Changes"
            ) : (
              "Create User"
            )}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Full name</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Jane Doe"
            data-testid="user-name-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Email</label>
          <input
            className="form-input"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="jane@company.com"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label required">Password</label>
        <input
          className="form-input"
          type="password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            value={form.departmentId}
            onChange={(e) => setField("departmentId", e.target.value)}
          >
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </Modal>
  );
}

/* ---- CSV Import Wizard ---- */
function CSVImportWizard({ departments, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: done
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const REQUIRED_COLS = ["name", "email", "password"];
  const SAMPLE_CSV = `name,email,password,role,department\nJohn Smith,john@company.com,pass123,user,Engineering\nSarah Lee,sarah@company.com,pass456,user,Marketing`;

  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const errs = [];
        const headers = Object.keys(data[0] || {}).map((h) =>
          h.toLowerCase().trim(),
        );
        REQUIRED_COLS.forEach((col) => {
          if (!headers.includes(col))
            errs.push(`Missing required column: "${col}"`);
        });
        const normalized = data.map((row, i) => {
          const r = {};
          Object.keys(row).forEach((k) => {
            r[k.toLowerCase().trim()] = row[k];
          });
          if (!r.name) errs.push(`Row ${i + 2}: missing name`);
          if (!r.email || !r.email.includes("@"))
            errs.push(`Row ${i + 2}: invalid email`);
          const dept = departments.find(
            (d) => d.name.toLowerCase() === (r.department || "").toLowerCase(),
          );
          return {
            name: r.name || "",
            email: r.email || "",
            password: r.password || "changeme",
            role: r.role === "admin" ? "admin" : "user",
            departmentId: dept?.id || "",
            status: "active",
            avatar: (r.name || "??")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            createdAt: new Date().toISOString(),
          };
        });
        setErrors(errs);
        setRows(normalized);
        setStep(2);
      },
    });
  }

  async function handleImport() {
    setLoading(true);
    try {
      const created = await Promise.all(rows.map((row) => api.createUser(row)));
      setStep(3);
      setTimeout(() => onSuccess(created), 800);
    } catch {
      alert("Import failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sample-users.csv";
    a.click();
  }

  return (
    <Modal
      title="Import Users from CSV"
      onClose={onClose}
      size="lg"
      footer={
        step === 2 ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={loading || rows.length === 0 || errors.length > 0}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload size={13} />
                  Import {rows.length} users
                </>
              )}
            </button>
          </>
        ) : step === 1 ? (
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        ) : null
      }
    >
      {/* Wizard steps */}
      <div className="wizard-steps">
        {["Upload", "Preview", "Done"].map((label, i) => {
          const num = i + 1;
          const cls = step > num ? "done" : step === num ? "active" : "";
          return (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <div className={`wizard-step ${cls}`} style={{ flex: 1 }}>
                <div className="wizard-step-num">
                  {step > num ? <CheckCircle size={14} /> : num}
                </div>
                <span className="wizard-step-label">{label}</span>
              </div>
              {i < 2 && (
                <div
                  className={`wizard-connector${step > num ? " done" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <>
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => {
              const inp = document.createElement("input");
              inp.type = "file";
              inp.accept = ".csv";
              inp.onchange = (e) => handleFile(e.target.files[0]);
              inp.click();
            }}
          >
            <div
              className="dropzone-icon"
              style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
            >
              <FileSpreadsheet size={28} color="var(--gray-400)" strokeWidth={1.5} />
            </div>
            <div className="dropzone-text">
              Drag your CSV file here, or{" "}
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                browse
              </span>
            </div>
            <div className="dropzone-hint">
              Must include columns: name, email, password
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              background: "var(--gray-50)",
              borderRadius: 8,
              border: "1px solid var(--gray-200)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-600)",
                marginBottom: 6,
              }}
            >
              CSV Format
            </div>
            <code
              style={{
                fontSize: 11,
                color: "var(--gray-600)",
                display: "block",
                lineHeight: 1.8,
              }}
            >
              name, email, password, role, department
              <br />
              John Smith, john@co.com, pass123, user, Engineering
            </code>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
              onClick={downloadSample}
            >
              <Download size={12} />
              Download sample CSV
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {errors.length > 0 && (
            <div className="alert alert-danger">
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>
                    {errors.length} validation error
                    {errors.length !== 1 ? "s" : ""} found:
                  </strong>
                  <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                    {errors.map((e, i) => (
                      <li key={i} style={{ fontSize: 12, marginTop: 2 }}>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div
            style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 12 }}
          >
            <strong style={{ color: "var(--gray-900)" }}>
              {rows.length} users
            </strong>{" "}
            ready to import from <strong>{fileName}</strong>
          </div>
          <div
            className="table-wrap"
            style={{
              maxHeight: 300,
              overflowY: "auto",
              border: "1px solid var(--gray-200)",
              borderRadius: 8,
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      {r.email}
                    </td>
                    <td>
                      <span
                        className={`badge ${r.role === "admin" ? "badge-purple" : "badge-blue"}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        {r.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                        {r.role}
                      </span>
                    </td>
                    <td>
                      {departments.find((d) => d.id === r.departmentId)
                        ?.name || (
                        <span style={{ color: "var(--gray-400)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <PartyPopper
              size={44}
              strokeWidth={1.5}
              style={{ color: "var(--primary)" }}
            />
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--gray-900)",
              marginBottom: 6,
            }}
          >
            Import complete!
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
            {rows.length} users added successfully
          </div>
        </div>
      )}
    </Modal>
  );
}