"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import {
  OrderedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/element/types";
import { ParamValue } from "next/dist/server/request/params";

const ExcalidrawWrapper = ({ sessionId }: { sessionId: ParamValue }) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const [theme, setTheme] = useState<Theme | undefined>();

  const socketRef = useRef<Socket | null>(null);
  const elementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const isUpdatingFromSocketRef = useRef(false);

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
      if (!excalidrawAPI || !socketRef.current) return;

      if (isUpdatingFromSocketRef.current) {
        return;
      }

      elementsRef.current = elements;
      appStateRef.current = appState;

      const theme = window.localStorage.getItem("theme") as Theme | undefined;
      setTheme(theme ?? "light");
    },
    [excalidrawAPI]
  );

  useEffect(() => {
    const handlePointerUp = () => {
      if (!elementsRef.current || !appStateRef.current || !socketRef.current)
        return;

      socketRef.current.emit("board:update", {
        sessionId,
        data: {
          elements: elementsRef.current,
          appStateRef: appStateRef.current,
        },
      });

      elementsRef.current = null;
      appStateRef.current = null;
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
      socket.emit("join-session", { sessionId });
    });

    socket.on("board:sync", (payload) => {
      const { elements, appState } = payload.data ?? payload;

      try {
        isUpdatingFromSocketRef.current = true;
        excalidrawAPI.updateScene({
          elements: elements ?? [],
          appState: appState ?? {},
        });

        setTimeout(() => {
          isUpdatingFromSocketRef.current = false;
        }, 100);
      } catch (error) {
        console.error("❌ Failed to update scene:", error);
        isUpdatingFromSocketRef.current = false;
      }
    });

    return () => {
      socket.off("connect");
      socket.off("board:sync");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [excalidrawAPI]);

  //cleanup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <Excalidraw
      excalidrawAPI={setExcalidrawAPI}
      onChange={handleChange}
      theme={theme}
    />
  );
};

export default ExcalidrawWrapper;
