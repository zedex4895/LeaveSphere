import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  Menu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  CheckCheck,
  Clock,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import { NotificationItem } from "../types";

interface NavbarProps {
  pageTitle: string;
  onToggleSidebar?: () => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle, onToggleSidebar }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.notifications.get();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Auto-poll notifications every 10 seconds for real-time updates on both user and admin ends
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) {
      fetchNotifications();
    }
    setIsDropdownOpen(prev => !prev);
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.notifications.markAsRead(id);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await api.notifications.markAllAsRead();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "REQUEST_SUBMITTED":
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(79, 70, 229, 0.12)",
              color: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <FileText size={18} />
          </div>
        );
      case "REQUEST_APPROVED":
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={18} />
          </div>
        );
      case "REQUEST_REJECTED":
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <XCircle size={18} />
          </div>
        );
      case "REQUEST_CANCELLED":
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Clock size={18} />
          </div>
        );
      case "HOLIDAY_PUBLISHED":
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(168, 85, 247, 0.12)",
              color: "#A855F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Calendar size={18} />
          </div>
        );
      default:
        return (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              color: "#6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Sparkles size={18} />
          </div>
        );
    }
  };

  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background-color 0.25s ease, border-color 0.25s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="btn btn-secondary"
            style={{ padding: "8px", display: "none" }}
            id="mobileMenuBtn"
          >
            <Menu size={18} />
          </button>
        )}
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "500" }}>
            LeaveSphere &nbsp;›&nbsp; <span style={{ color: "var(--text-muted)" }}>{pageTitle}</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", letterSpacing: "-0.01em" }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="btn btn-secondary"
          style={{
            width: "40px",
            height: "40px",
            padding: 0,
            borderRadius: "50%",
            color: "var(--text-main)"
          }}
        >
          {theme === "dark" ? (
            <Sun size={18} style={{ color: "#FBBF24" }} />
          ) : (
            <Moon size={18} style={{ color: "#6366F1" }} />
          )}
        </button>

        {/* Notifications Popover Bell */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            className="btn btn-secondary"
            style={{
              width: "40px",
              height: "40px",
              padding: 0,
              borderRadius: "50%",
              position: "relative",
              color: unreadCount > 0 ? "var(--primary)" : "var(--text-main)"
            }}
            title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : "Notifications"}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.4)",
                  border: "2px solid var(--surface)"
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "380px",
                maxWidth: "calc(100vw - 32px)",
                backgroundColor: "var(--surface)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.18), 0 10px 15px -5px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                zIndex: 100,
                animation: "fadeInDown 0.18s ease-out"
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--surface-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: "999px"
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div
                style={{
                  maxHeight: "380px",
                  overflowY: "auto"
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 24px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px"
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "var(--surface-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-light)"
                      }}
                    >
                      <Bell size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                        No notifications yet
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "240px" }}>
                        Updates about leave submissions, approvals, and company announcements will show up here.
                      </div>
                    </div>
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: item.isRead
                          ? "transparent"
                          : theme === "dark"
                            ? "rgba(79, 70, 229, 0.10)"
                            : "rgba(238, 242, 255, 0.7)",
                        cursor: item.isRead ? "default" : "pointer",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={e => {
                        if (item.isRead) e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                      }}
                      onMouseLeave={e => {
                        if (item.isRead) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {getNotificationIcon(item.type)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            marginBottom: "2px"
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: item.isRead ? "600" : "700",
                              color: "var(--text-main)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-light)",
                              whiteSpace: "nowrap",
                              flexShrink: 0
                            }}
                          >
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: item.isRead ? "var(--text-muted)" : "var(--text-main)",
                            lineHeight: "1.45",
                            margin: 0,
                            wordBreak: "break-word"
                          }}
                        >
                          {item.message}
                        </p>
                      </div>
                      {!item.isRead && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            marginTop: "6px",
                            flexShrink: 0
                          }}
                          title="Unread"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>


            </div>
          )}
        </div>

        {/* User Pill */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 8px 4px 12px",
              backgroundColor: "var(--surface-subtle)",
              borderRadius: "999px",
              border: "1px solid var(--border)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                {user.name}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-light)" }}>
                {user.role === "ADMIN" ? "Administrator" : user.department || "Employee"}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="btn btn-secondary"
              style={{
                padding: "6px",
                borderRadius: "50%",
                border: "none",
                marginLeft: "4px",
                color: "var(--text-muted)"
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
