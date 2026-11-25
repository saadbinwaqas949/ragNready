import { ImageResponse } from "next/og";

export const alt = "ragNready baby clothing and gifts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card shown when the shop link is shared on WhatsApp, Instagram or Facebook. */
export default function OpenGraphImage() {
  const cloths = ["#e9d9c4", "#f3dd95", "#cfe7dd", "#f1d0cd", "#dcd2ee", "#c6def0"];
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(#cfe4f2, #faf8f4 72%)", color: "#1f3350" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ height: 5, marginTop: 74, background: "#8b7355", display: "flex" }} />
        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 60px" }}>
          {cloths.map((color, index) => <div key={color} style={{ width: 118, height: 120 + (index % 3) * 26, borderRadius: "14px 14px 46px 46px", background: color, border: "3px dashed rgba(31,51,80,.28)", display: "flex" }} />)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "0 80px 70px" }}>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -5 }}>rag<span style={{ color: "#2c6e9e" }}>N</span>ready</div>
        <div style={{ display: "flex", fontSize: 38, color: "#566479" }}>Baby clothing and gifts. Cash on delivery across Pakistan.</div>
      </div>
    </div>,
    size,
  );
}
