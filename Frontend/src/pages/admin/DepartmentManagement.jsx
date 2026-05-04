import { useState, useEffect } from "react";
import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";
import Modal from "../../components/common/Modal";
import { Building2, Users, UserCog, Plus } from "lucide-react";

export default function DepartmentManagement() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showAssign, setShowAssign] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [depts, users] = await Promise.all([
          api.getDepartments(),
          api.getUsers(),
        ]);
        dispatch({ type: "SET_DEPARTMENTS", payload: depts });
        dispatch({ type: "SET_USERS", payload: users });
      } catch {
        toast("Failed to load departments", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getUsersInDept(deptId) {
    return state.users.filter((u) => u.departmentId === deptId);
  }

  async function handleDelete(dept) {
    const members = getUsersInDept(dept.id);
    if (members.length > 0) {
      toast(
        `Cannot delete: ${members.length} user(s) are in this department`,
        "error",
      );
      return;
    }
    if (!window.confirm(`Delete department "${dept.name}"?`)) return;
    try {
      await api.deleteDepartment(dept.id);
      dispatch({ type: "DELETE_DEPARTMENT", payload: dept.id });
      toast(`Department "${dept.name}" deleted`);
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
        <span className="topbar-title">Departments</span>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Department
        </button>
      </div>

      <div className="page-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {state.departments.map((dept) => {
            const members = getUsersInDept(dept.id);
            const manager = state.users.find((u) => u.id === dept.managerId);

            return (
              <div key={dept.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "var(--primary-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {dept.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                        {dept.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowEdit(dept)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--danger)" }}
                      onClick={() => handleDelete(dept)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Manager */}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--gray-500)",
                    marginBottom: 10,
                  }}
                >
                  Manager:{" "}
                  <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>
                    {manager?.name || "—"}
                  </span>
                </div>

                {/* Members */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--gray-600)",
                    }}
                  >
                    {members.length} member
                    {members.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAssign(dept)}
                  >
                    <Users size={14} /> Manage Members
                  </button>
                </div>

                {members.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {members.slice(0, 6).map((u) => (
                      <div
                        key={u.id}
                        className="avatar sm"
                        title={u.name}
                        style={{ fontSize: 9 }}
                      >
                        {u.avatar || u.name.slice(0, 2)}
                      </div>
                    ))}
                    {members.length > 6 && (
                      <div
                        className="avatar sm"
                        style={{
                          fontSize: 9,
                          background: "var(--gray-200)",
                          color: "var(--gray-600)",
                        }}
                      >
                        +{members.length - 6}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--gray-400)",
                      fontStyle: "italic",
                    }}
                  >
                    No members yet
                  </div>
                )}
              </div>
            );
          })}

          {state.departments.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <Building2 size={32} />
              <div className="empty-title">No departments yet</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreate(true)}
              >
                Create first department
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <DeptFormModal
          title="New Department"
          users={state.users}
          onClose={() => setShowCreate(false)}
          onSuccess={(dept) => {
            dispatch({ type: "ADD_DEPARTMENT", payload: dept });
            setShowCreate(false);
            toast(`Department "${dept.name}" created!`);
          }}
        />
      )}

      {showEdit && (
        <DeptFormModal
          title="Edit Department"
          dept={showEdit}
          users={state.users}
          onClose={() => setShowEdit(null)}
          onSuccess={(dept) => {
            dispatch({ type: "UPDATE_DEPARTMENT", payload: dept });
            setShowEdit(null);
            toast("Department updated!");
          }}
        />
      )}

      {showAssign && (
        <AssignMembersModal
          dept={showAssign}
          users={state.users}
          onClose={() => setShowAssign(null)}
          onSuccess={(updatedUsers) => {
            updatedUsers.forEach((u) =>
              dispatch({ type: "UPDATE_USER", payload: u }),
            );
            setShowAssign(null);
            toast("Members updated!");
          }}
        />
      )}
    </div>
  );
}

/* ===================== MODALS ===================== */

function DeptFormModal({ title, dept, users, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: dept?.name || "",
    description: dept?.description || "",
    managerId: dept?.managerId || "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name) return;
    setLoading(true);
    try {
      const result = dept
        ? await api.updateDepartment(dept.id, form)
        : await api.createDepartment(form);
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
            onClick={handleSubmit}
            disabled={loading || !form.name}
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label required">Department name</label>
        <input
          className="form-input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          className="form-input"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Manager</label>
        <select
          className="form-select"
          value={form.managerId}
          onChange={(e) =>
            setForm((f) => ({ ...f, managerId: e.target.value }))
          }
        >
          <option value="">No manager assigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function AssignMembersModal({ dept, users, onClose, onSuccess }) {
  const [memberIds, setMemberIds] = useState(
    users.filter((u) => u.departmentId === dept.id).map((u) => u.id),
  );
  const [loading, setLoading] = useState(false);

  function toggle(id) {
    setMemberIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  async function handleSave() {
    setLoading(true);
    try {
      const updates = users.map((u) => {
        const shouldBe = memberIds.includes(u.id);
        const isIn = u.departmentId === dept.id;
        if (shouldBe && !isIn)
          return api.updateUser(u.id, { departmentId: dept.id });
        if (!shouldBe && isIn)
          return api.updateUser(u.id, { departmentId: "" });
        return Promise.resolve(u);
      });
      const results = await Promise.all(updates);
      onSuccess(results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={`Manage members — ${dept.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : `Save (${memberIds.length} members)`}
          </button>
        </>
      }
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--gray-500)",
          marginBottom: 14,
        }}
      >
        Select users to assign to{" "}
        <strong style={{ color: "var(--gray-800)" }}>{dept.name}</strong>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxHeight: 380,
          overflowY: "auto",
        }}
      >
        {users.map((u) => (
          <label
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              border: `1px solid ${
                memberIds.includes(u.id) ? "var(--primary)" : "var(--gray-200)"
              }`,
              borderRadius: 8,
              cursor: "pointer",
              background: memberIds.includes(u.id)
                ? "var(--primary-light)"
                : "white",
            }}
          >
            <input
              type="checkbox"
              checked={memberIds.includes(u.id)}
              onChange={() => toggle(u.id)}
            />
            <div className="avatar" style={{ width: 32, height: 32 }}>
              {u.avatar || u.name.slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                {u.email}
              </div>
            </div>
            <span
              className={`badge ${
                u.role === "admin" ? "badge-purple" : "badge-blue"
              }`}
            >
              <UserCog size={12} /> {u.role}
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
