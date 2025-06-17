"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useState, useRef } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const sessionId = "abc123";

const ExcalidrawWrapper = () => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const elementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(null);
  const isUpdatingFromSocketRef = useRef(false);

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      if (!excalidrawAPI || !socketRef.current) return;

      if (isUpdatingFromSocketRef.current) {
        return;
      }

      elementsRef.current = elements;
    },
    [excalidrawAPI]
  );

  useEffect(() => {
    const handlePointerUp = () => {
      if (!elementsRef.current || !socketRef.current) return;

      console.log("🖱️ Pointer up – sending board update");

      socketRef.current.emit("board:update", {
        sessionId,
        data: {
          elements: elementsRef.current,
        },
      });

      elementsRef.current = null;
    };

    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!excalidrawAPI) return;

    socketRef.current ??= io("http://localhost:3005");

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      socket.emit("join-session", { sessionId });
    });

    socket.on("board:sync", (payload) => {
      const { elements } = payload.data ?? payload;

      try {
        isUpdatingFromSocketRef.current = true;
        excalidrawAPI.updateScene({ elements: elements ?? [] });

        setTimeout(() => {
          isUpdatingFromSocketRef.current = false;
        }, 100);
      } catch (error) {
        console.error("❌ Failed to update scene:", error);
        isUpdatingFromSocketRef.current = false;
      }
    });

    socket.on("disconnect", () => console.log("🔴 Disconnected"));
    socket.on("connect_error", (err) =>
      console.error("❌ Connection error:", err)
    );

    return () => {
      socket.off("connect");
      socket.off("board:sync");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [excalidrawAPI]);

  // cleanup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <Excalidraw excalidrawAPI={setExcalidrawAPI} onChange={handleChange} />
  );
};

export default ExcalidrawWrapper;
