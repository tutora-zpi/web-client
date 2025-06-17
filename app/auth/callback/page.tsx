"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (token) {
        try {
          const response = await fetch("/api/auth/set-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            router.refresh();
            router.push("/dashboard");
          } else {
            console.error("Failed to set token");
            router.push("/login");
          }
        } catch (error) {
          console.error("Error setting token:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Logowanie...</p>
      </div>
    </div>
  );
}
