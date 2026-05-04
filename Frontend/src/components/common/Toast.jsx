import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

export default function Toast() {
  const { state, dispatch } = useApp();
  if (!state.toast) return null;

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
    error: { bg: "#FEF2F2", border: "#FEE2E2", color: "#991B1B" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
    info: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF" },
  };

  const style = colors[state.toast.type] || colors.info;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        fontSize: 13,
        fontWeight: 500,
        maxWidth: 360,
        animation: "slideUp 0.2s ease",
      }}
    >
      <span style={{ display: "flex" }}>{icons[state.toast.type]}</span>

      <span style={{ flex: 1 }}>{state.toast.message}</span>

      <button
        onClick={() => dispatch({ type: "HIDE_TOAST" })}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.6,
          padding: 0,
          display: "flex",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
