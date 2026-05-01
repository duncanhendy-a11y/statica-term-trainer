"use client";
export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #E5E7EB",
      background: "#fff",
      padding: "24px",
      marginTop: "40px",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Designed and built by</span>
        <a
          href="https://duncanhendy.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            padding: "5px 12px",
            borderRadius: "999px",
            border: "1px solid #E5E7EB",
            background: "#F9FAFB",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#F36E22";
            (e.currentTarget as HTMLElement).style.background = "#FFF7F3";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
            (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
          }}>
          {/* DH monogram */}
          <span style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "#F36E22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}>DH</span>
          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
          }}>Duncan Hendy</span>
        </a>
      </div>
    </footer>
  );
}
