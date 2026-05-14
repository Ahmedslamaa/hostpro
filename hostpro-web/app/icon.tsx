// Next.js auto-generates /icon.png from this file
// Used as favicon + PWA icon fallback
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF5A5F",
          borderRadius: "96px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 280,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          H
        </div>
      </div>
    ),
    { ...size }
  );
}
