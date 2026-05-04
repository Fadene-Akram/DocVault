import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { FileText, Users, Building2, Tags, LogOut } from "lucide-react";

export default function AdminLayout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  function logout() {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">D</div>
          <span className="logo-text">DocVault</span>
          <span
            style={{
              fontSize: 10,
              background: "var(--primary)",
              color: "white",
              padding: "1px 6px",
              borderRadius: 10,
              fontWeight: 700,
              marginLeft: 4,
            }}
          >
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Content</div>

          <NavLink
            to="/admin/documents"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <FileText size={16} className="nav-icon" />
            Documents
          </NavLink>

          <div className="nav-section-title" style={{ marginTop: 8 }}>
            Administration
          </div>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Users size={16} className="nav-icon" />
            Users
          </NavLink>

          <NavLink
            to="/admin/departments"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Building2 size={16} className="nav-icon" />
            Departments
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Tags size={16} className="nav-icon" />
            Categories
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {state.user?.avatar || state.user?.name?.slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="user-name"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {state.user?.name}
              </div>
              <div className="user-role">Administrator</div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm w-full"
            style={{ justifyContent: "center", marginTop: 4, gap: 6 }}
            onClick={logout}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
