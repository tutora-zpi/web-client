import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tutora",
    short_name: "Tutora",
    description:
      "Tutora is an engineering thesis project focused on building a modern, scalable and secure platform for online tutoring. The system integrates real-time communication, an interactive whiteboard, shared learning materials, and AI-generated notes and tests. The architecture is designed as a distributed microservices ecosystem with a Next.js web client.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
