import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showText = true, className = "" }) => {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textSize = size === "sm" ? "17px" : size === "lg" ? "24px" : "20px";
  const ringBorderWidth = size === "sm" ? "4.5px" : size === "lg" ? "7px" : "6px";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "8px" : "12px",
        userSelect: "none"
      }}
    >
      {/* Rainbow Spectrum Sphere Ring matching uploaded logo */}
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: "50%",
          padding: ringBorderWidth,
          background:
            "conic-gradient(from 270deg at 50% 50%, #FF4500 0deg, #FFB800 60deg, #7FC535 120deg, #00D26A 160deg, #00B4D8 220deg, #8B5CF6 270deg, #BC14A4 315deg, #FF4500 360deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(255, 69, 0, 0.18), 0 2px 6px rgba(0, 180, 216, 0.15)",
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "var(--surface)",
            transition: "background-color 0.25s ease"
          }}
        />
      </div>

      {showText && (
        <div
          style={{
            fontSize: textSize,
            fontWeight: "800",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline"
          }}
        >
          <span style={{ color: "var(--text-main)", transition: "color 0.25s ease" }}>Leave</span>
          <span
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #FF8A00 25%, #E11D48 50%, #8B5CF6 80%, #00B4D8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 8px rgba(255, 69, 0, 0.15))"
            }}
          >
            Sphere
          </span>
        </div>
      )}
    </div>
  );
};
