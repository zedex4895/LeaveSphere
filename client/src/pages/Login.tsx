import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, LogIn, Sun, Moon, AlertCircle, ChevronDown, User } from "lucide-react";
import { Logo } from "../components/Logo";

export const Login: React.FC = () => {
  const { login, theme, toggleTheme } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme === "dark" ? "#0A0D14" : "#D6CECB",
        backgroundImage: theme === "dark"
          ? "radial-gradient(circle at 50% 50%, #151C2C 0%, #0A0D14 100%)"
          : "radial-gradient(circle at 50% 50%, #EFEBE9 0%, #D7CFCB 100%)",
        padding: "32px 20px",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Central Split Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1160px",
          minHeight: "720px",
          backgroundColor: theme === "dark" ? "#121826" : "#FFFFFF",
          borderRadius: "44px",
          overflow: "hidden",
          boxShadow: theme === "dark"
            ? "0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)"
            : "0 35px 80px -20px rgba(70, 50, 40, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexWrap: "wrap",
          position: "relative"
        }}
      >
        {/*LEFT SIDE (DARK HERO WITH PHONE)  */}
        <div
          style={{
            flex: "1 1 520px",
            backgroundColor: "#1A1513",
            background: "linear-gradient(180deg, #1C1715 0%, #14100E 100%)",
            color: "#FFFFFF",
            padding: "48px 48px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Subtle background ambient rings */}
          <div
            style={{
              position: "absolute",
              top: "55%",
              left: "48%",
              transform: "translate(-50%, -50%)",
              width: "480px",
              height: "480px",
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              pointerEvents: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "55%",
              left: "48%",
              transform: "translate(-50%, -50%)",
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              pointerEvents: "none"
            }}
          />

          {/* Top Tagline */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <p
              style={{
                fontSize: "12.5px",
                color: "#A39E9B",
                fontWeight: "400",
                letterSpacing: "0.01em",
                maxWidth: "380px",
                lineHeight: "1.4"
              }}
            >
              LeaveSphere — Global leave management made simple for modern teams.
            </p>
          </div>

          {/* Giant Headline */}
          <div style={{ position: "relative", zIndex: 2, marginTop: "28px" }}>
            <h1
              style={{
                fontSize: "clamp(38px, 4.5vw, 54px)",
                fontWeight: "800",
                lineHeight: "1.08",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                margin: 0
              }}
            >
              Manage<br />your leave
            </h1>
          </div>

          {/* Phone Mockup Graphic */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: "280px",
                maxWidth: "100%",
                borderRadius: "32px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)",
                transform: "translateY(10px) rotate(-1.5deg)",
                transition: "transform 0.4s ease"
              }}
            >
              <img
                src="/assets/leave_app_phone.jpg"
                alt="LeaveSphere Mobile Leave Management Dashboard"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover"
                }}
              />
            </div>
          </div>

          {/* Bottom brand dot / accessibility badge */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              marginTop: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1.5px solid #FF5500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF5500",
                fontSize: "13px",
                fontWeight: "700"
              }}
              title="LeaveSphere Accessibility & Compliance"
            >
              ✦
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE (CLEAN SIGN IN) ================= */}
        <div
          style={{
            flex: "1 1 520px",
            backgroundColor: theme === "dark" ? "#121826" : "#FFFFFF",
            padding: "48px 56px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "background-color 0.25s ease"
          }}
        >
          {/* Top Bar: Brand Logo & Sign Up link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "40px"
            }}
          >
            {/* LeaveSphere Brand Logo */}
            <Logo size="lg" />

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: theme === "dark" ? "#FBBF24" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <a
                href="#signup"
                onClick={e => {
                  e.preventDefault();
                  alert("Sign-up is managed by your organization's HR administrator. Please log in with your assigned employee or admin credentials.");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  color: theme === "dark" ? "#94A3B8" : "#4B5563",
                  fontWeight: "500",
                  textDecoration: "none"
                }}
              >
                <User size={15} />
                <span>Sign Up</span>
              </a>
            </div>
          </div>

          {/* Form Container */}
          <div style={{ maxWidth: "420px", width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: theme === "dark" ? "#F8FAFC" : "#111827",
                letterSpacing: "-0.03em",
                marginBottom: "28px"
              }}
            >
              Sign In
            </h2>

            {/* Error Notification */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "var(--badge-rejected-bg)",
                  color: "var(--badge-rejected-color)",
                  border: "1px solid var(--badge-rejected-border)",
                  borderRadius: "18px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px"
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit}>
              {/* Email / Username field */}
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "54px",
                    padding: "0 24px",
                    borderRadius: "999px",
                    border: theme === "dark" ? "1.5px solid #23304D" : "1.5px solid #E5E7EB",
                    backgroundColor: theme === "dark" ? "#131B2E" : "#FFFFFF",
                    color: theme === "dark" ? "#F8FAFC" : "#111827",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#FF5500";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255, 85, 0, 0.12)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = theme === "dark" ? "#23304D" : "#E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password field */}
              <div style={{ marginBottom: "14px", position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "54px",
                    padding: "0 54px 0 24px",
                    borderRadius: "999px",
                    border: theme === "dark" ? "1.5px solid #23304D" : "1.5px solid #E5E7EB",
                    backgroundColor: theme === "dark" ? "#131B2E" : "#FFFFFF",
                    color: theme === "dark" ? "#F8FAFC" : "#111827",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#FF5500";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255, 85, 0, 0.12)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = theme === "dark" ? "#23304D" : "#E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot password link */}
              <div style={{ marginBottom: "26px" }}>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert("Please contact your LeaveSphere system administrator (admin@example.com) to reset your account password.");
                  }}
                  style={{
                    fontSize: "13px",
                    color: "#EA580C",
                    textDecoration: "none",
                    fontWeight: "500"
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Vibrant Sunset Pill CTA Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(90deg, #FF4B1F 0%, #FF2525 50%, #E91E63 100%)",
                  boxShadow: "0 10px 25px -4px rgba(255, 75, 31, 0.4)",
                  color: "#FFFFFF",
                  fontSize: "15.5px",
                  fontWeight: "600",
                  letterSpacing: "0.01em",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1.5px)";
                  e.currentTarget.style.boxShadow = "0 14px 28px -4px rgba(255, 75, 31, 0.55)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(255, 75, 31, 0.4)";
                }}
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2.4} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer on Right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: theme === "dark" ? "#64748B" : "#9CA3AF",
              marginTop: "40px",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <span>© 2026 LeaveSphere Inc.</span>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <a
                href="#contact"
                onClick={e => e.preventDefault()}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Contact Us
              </a>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                <span>English</span>
                <ChevronDown size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
