import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeyX — เช็คสต๊อกของใช้ในบ้าน ไม่พลาด ไม่ซื้อซ้ำ",
    short_name: "HomeyX",
    description: "Smart Home Stock & Grocery List Management Application",
    start_url: "/dashboard",
    display: "standalone",
    display_override: ["standalone", "fullscreen", "minimal-ui"],
    background_color: "#FAF7F2",
    theme_color: "#C25E40",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
