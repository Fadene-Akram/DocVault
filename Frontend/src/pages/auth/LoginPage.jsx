
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useApp, useToast } from "../../contexts/AppContext";
// import { api } from "../../utils/api";

// export default function LoginPage() {
//   const { dispatch } = useApp();
//   const toast = useToast();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const user = await api.loginUser(form.email, form.password);
//       dispatch({ type: "LOGIN", payload: user });
//       toast(`Welcome back, ${user.name}!`);
//       navigate(user.role === "admin" ? "/admin/users" : "/documents");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function quickLogin(email, password) {
//     setForm({ email, password });
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "var(--gray-50)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 20,
//       }}
//     >
//       {/* Decorative background blobs */}
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           overflow: "hidden",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             top: "-10%",
//             right: "-5%",
//             width: 500,
//             height: 500,
//             borderRadius: "50%",
//             background:
//               "radial-gradient(circle, rgba(91,80,232,0.08) 0%, transparent 70%)",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             bottom: "-10%",
//             left: "-5%",
//             width: 400,
//             height: 400,
//             borderRadius: "50%",
//             background:
//               "radial-gradient(circle, rgba(91,80,232,0.06) 0%, transparent 70%)",
//           }}
//         />
//       </div>

//       <div
//         style={{
//           width: "100%",
//           maxWidth: 420,
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         {/* Logo */}
//         <div style={{ textAlign: "center", marginBottom: 36 }}>
//           <div
//             style={{
//               width: 60,
//               height: 60,
//               background: "var(--primary)",
//               borderRadius: 18,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 16px",
//               fontSize: 28,
//               fontWeight: 800,
//               color: "white",
//               boxShadow: "0 8px 24px rgba(91,80,232,0.3)",
//             }}
//           >
//             D
//           </div>
//           <h1
//             style={{
//               fontSize: 26,
//               fontWeight: 800,
//               color: "var(--gray-900)",
//               letterSpacing: "-0.5px",
//             }}
//           >
//             DocVault
//           </h1>
//           <p style={{ color: "var(--gray-400)", fontSize: 14, marginTop: 5 }}>
//             Document Management System
//           </p>
//         </div>

//         <div
//           style={{
//             background: "white",
//             border: "1px solid var(--gray-200)",
//             borderRadius: "var(--radius-xl)",
//             padding: 32,
//             boxShadow: "var(--shadow-md)",
//           }}
//         >
//           <h2
//             style={{
//               fontSize: 18,
//               fontWeight: 700,
//               marginBottom: 24,
//               color: "var(--gray-900)",
//             }}
//           >
//             Sign in to your account
//           </h2>

//           {error && (
//             <div className="alert alert-danger" style={{ marginBottom: 20 }}>
//               <span>⚠️</span> {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label required">Email address</label>
//               <input
//                 className="form-input"
//                 type="email"
//                 placeholder="you@company.com"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, email: e.target.value }))
//                 }
//                 required
//                 data-testid="email-input"
//               />
//             </div>
//             <div className="form-group">
//               <label className="form-label required">Password</label>
//               <input
//                 className="form-input"
//                 type="password"
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, password: e.target.value }))
//                 }
//                 required
//                 data-testid="password-input"
//               />
//             </div>
//             <button
//               className="btn btn-primary w-full"
//               type="submit"
//               disabled={loading}
//               style={{
//                 justifyContent: "center",
//                 padding: "10px 16px",
//                 fontSize: 14,
//                 marginTop: 4,
//               }}
//               data-testid="login-btn"
//             >
//               {loading ? (
//                 <>
//                   <span
//                     className="spinner"
//                     style={{ width: 14, height: 14, borderWidth: 2 }}
//                   />{" "}
//                   Signing in…
//                 </>
//               ) : (
//                 "Sign in →"
//               )}
//             </button>
//           </form>

//           {/* Demo accounts */}
//           <div
//             style={{
//               marginTop: 24,
//               paddingTop: 20,
//               borderTop: "1px solid var(--gray-100)",
//             }}
//           >
//             <p
//               style={{
//                 fontSize: 11,
//                 color: "var(--gray-400)",
//                 marginBottom: 12,
//                 fontWeight: 600,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.08em",
//                 textAlign: "center",
//               }}
//             >
//               Demo accounts
//             </p>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 10,
//               }}
//             >
//               {[
//                 {
//                   label: "Admin",
//                   icon: "🛡️",
//                   email: "admin@docvault.io",
//                   password: "admin123",
//                   testId: "demo-admin",
//                 },
//                 {
//                   label: "End User",
//                   icon: "👤",
//                   email: "bob@docvault.io",
//                   password: "user123",
//                   testId: "demo-user",
//                 },
//               ].map((account) => (
//                 <button
//                   key={account.label}
//                   data-testid={account.testId}
//                   onClick={() => quickLogin(account.email, account.password)}
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     gap: 4,
//                     padding: "12px 10px",
//                     border: "1.5px solid var(--gray-200)",
//                     borderRadius: "var(--radius)",
//                     background: "var(--gray-50)",
//                     cursor: "pointer",
//                     transition: "all 0.15s",
//                     fontFamily: "inherit",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.borderColor = "var(--primary-mid)";
//                     e.currentTarget.style.background = "var(--primary-light)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.borderColor = "var(--gray-200)";
//                     e.currentTarget.style.background = "var(--gray-50)";
//                   }}
//                 >
//                   <span style={{ fontSize: 20 }}>{account.icon}</span>
//                   <span
//                     style={{
//                       fontSize: 13,
//                       fontWeight: 600,
//                       color: "var(--gray-800)",
//                     }}
//                   >
//                     {account.label}
//                   </span>
//                   <span style={{ fontSize: 11, color: "var(--gray-400)" }}>
//                     {account.email}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  AlertTriangle,
  ArrowRight,
  LogIn,
} from "lucide-react";

import { useApp, useToast } from "../../contexts/AppContext";
import { api } from "../../utils/api";

export default function LoginPage() {
  const { dispatch } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.loginUser(form.email, form.password);
      dispatch({ type: "LOGIN", payload: user });
      toast(`Welcome back, ${user.name}!`);
      navigate(user.role === "admin" ? "/admin/users" : "/documents");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(email, password) {
    setForm({ email, password });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gray-50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(91,80,232,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(91,80,232,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "var(--primary)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(91,80,232,0.3)",
            }}
          >
            <LogIn size={28} color="white" />
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--gray-900)",
              letterSpacing: "-0.5px",
            }}
          >
            DocVault
          </h1>
          <p style={{ color: "var(--gray-400)", fontSize: 14, marginTop: 5 }}>
            Document Management System
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--gray-200)",
            borderRadius: "var(--radius-xl)",
            padding: 32,
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 24,
              color: "var(--gray-900)",
            }}
          >
            Sign in to your account
          </h2>

          {error && (
            <div
              className="alert alert-danger"
              style={{
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                data-testid="email-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                data-testid="password-input"
              />
            </div>

            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={loading}
              style={{
                justifyContent: "center",
                padding: "10px 16px",
                fontSize: 14,
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              data-testid="login-btn"
            >
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: 14, height: 14, borderWidth: 2 }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--gray-100)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--gray-400)",
                marginBottom: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textAlign: "center",
              }}
            >
              Demo accounts
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                {
                  label: "Admin",
                  icon: Shield,
                  email: "admin@docvault.io",
                  password: "admin123",
                  testId: "demo-admin",
                },
                {
                  label: "End User",
                  icon: User,
                  email: "bob@docvault.io",
                  password: "user123",
                  testId: "demo-user",
                },
              ].map(({ label, icon: Icon, email, password, testId }) => (
                <button
                  key={label}
                  data-testid={testId}
                  onClick={() => quickLogin(email, password)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 10px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "var(--radius)",
                    background: "var(--gray-50)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-mid)";
                    e.currentTarget.style.background = "var(--primary-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.background = "var(--gray-50)";
                  }}
                >
                  <Icon size={20} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--gray-800)",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--gray-400)" }}>
                    {email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}