// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { useApp } from "../../contexts/AppContext";

// export default function UserLayout() {
//   const { state, dispatch } = useApp();
//   const navigate = useNavigate();

//   function logout() {
//     dispatch({ type: "LOGOUT" });
//     navigate("/login");
//   }

//   const initials =
//     state.user?.avatar || state.user?.name?.slice(0, 2)?.toUpperCase();

//   return (
//     <div className="app-layout">
//       <aside className="sidebar">
//         <div className="sidebar-logo">
//           <div className="logo-icon">D</div>
//           <span className="logo-text">DocVault</span>
//         </div>

//         <nav className="sidebar-nav">
//           <div className="nav-section-title">Documents</div>
//           <NavLink
//             to="/documents"
//             className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
//           >
//             <span className="nav-icon">📄</span>
//             All Documents
//           </NavLink>
//         </nav>

//         <div className="sidebar-footer">
//           <div className="user-info">
//             <div className="avatar">{initials}</div>
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div className="user-name">{state.user?.name}</div>
//               <div className="user-role">End User</div>
//             </div>
//           </div>
//           <button className="signout-btn" onClick={logout}>
//             ↩ Sign out
//           </button>
//         </div>
//       </aside>

//       <main className="main-content">
//         <Outlet />
//       </main>
//     </div>
//   );
// }
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { FileText, LogOut } from "lucide-react";

export default function UserLayout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  function logout() {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  }

  const initials =
    state.user?.avatar || state.user?.name?.slice(0, 2)?.toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">D</div>
          <span className="logo-text">DocVault</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Documents</div>

          <NavLink
            to="/documents"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <FileText size={16} className="nav-icon" />
            All Documents
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{state.user?.name}</div>
              <div className="user-role">End User</div>
            </div>
          </div>

          <button className="signout-btn" onClick={logout}>
            <LogOut size={14} style={{ marginRight: 6 }} />
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
