"use client";
import { CaptureUpdateAction, Excalidraw } from "@excalidraw/excalidraw";
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
import { useTheme } from "next-themes";
import { WSConnect } from "@/lib/websocket/ws-connect";
import { WSBoard, WSGeneral } from "@/types/websocket";

type ToolType =
  | "selection"
  | "lasso"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "freedraw"
  | "text"
  | "image"
  | "eraser"
  | "hand"
  | "frame"
  | "magicframe"
  | "embeddable"
  | "laser";

const ExcalidrawWrapper = ({
  meetingId,
  token,
  userId,
}: {
  meetingId: string;
  token: string;
  userId: string;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const [theme, setTheme] = useState<Theme | undefined>();

  const { theme: themeMode } = useTheme();

  const socketRef = useRef<WebSocket | null>(null);
  const elementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(null);
  const isUpdatingFromSocketRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const excalidrawContainerRef = useRef<HTMLDivElement>(null);
  const activeToolRef = useRef<ToolType | null>(null);

  const isDrawingRef = useRef(false);
  const pendingSocketUpdateRef = useRef<
    readonly OrderedExcalidrawElement[] | null
  >(null);

  const isEditingTextRef = useRef(false);
  const lastTextUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!themeMode) return;
    setTheme((themeMode as string) === "dark" ? "dark" : "light");
  }, [themeMode]);

  const sendUpdate = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            name: WSBoard.BoardUpdateWSEvent,
            data: {
              meetingId,
              data: {
                elements,
              },
            },
          })
        );
      }
    },
    [meetingId]
  );

  const handleChange = useCallback(
    (newElements: readonly OrderedExcalidrawElement[], appState: AppState) => {
      if (!excalidrawAPI || !socketRef.current) return;

      activeToolRef.current = appState.activeTool.type as ToolType;

      const isCurrentlyEditingText = appState.editingTextElement !== null;
      isEditingTextRef.current = isCurrentlyEditingText;

      if (isUpdatingFromSocketRef.current) {
        return;
      }

      elementsRef.current = newElements;

      if (isCurrentlyEditingText) {
        const now = Date.now();
        if (now - lastTextUpdateRef.current > 100) {
          sendUpdate(newElements);
          lastTextUpdateRef.current = now;
        }
      }
    },
    [excalidrawAPI, sendUpdate]
  );

  const handleLocalPointerDown = () => {
    isDrawingRef.current = true;
  };

  const handleLocalPointerUp = () => {
    isDrawingRef.current = false;

    if (elementsRef.current && socketRef.current && activeToolRef.current) {
      const POINTER_UP_TOOLS: ToolType[] = [
        "selection",
        "lasso",
        "rectangle",
        "diamond",
        "ellipse",
        "arrow",
        "line",
        "freedraw",
      ];
      if (POINTER_UP_TOOLS.includes(activeToolRef.current)) {
        sendUpdate(elementsRef.current);
        elementsRef.current = null;
      }
    }
    if (pendingSocketUpdateRef.current && excalidrawAPI) {
      try {
        isUpdatingFromSocketRef.current = true;
        excalidrawAPI.updateScene({
          elements: pendingSocketUpdateRef.current ?? [],
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        });
        isUpdatingFromSocketRef.current = false;
      } catch (error) {
        console.error("Error applying pending scene update:", error);
        isUpdatingFromSocketRef.current = false;
      }
      pendingSocketUpdateRef.current = null;
    }
  };

  useEffect(() => {
    const INTERVAL_TOOLS: ToolType[] = ["eraser"];
    const interval = setInterval(() => {
      if (
        socketRef.current &&
        activeToolRef.current &&
        elementsRef.current &&
        INTERVAL_TOOLS.includes(activeToolRef.current)
      ) {
        sendUpdate(elementsRef.current);
        elementsRef.current = null;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [meetingId, sendUpdate]);

  useEffect(() => {
    if (!excalidrawAPI) return;

    const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
    const url = `${gateway}/ws?token=${token}`;
    const ws = WSConnect(url);
    socketRef.current = ws;

    const handleOpen = () => {
      if (hasJoinedRef.current) return;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            name: WSGeneral.UserJoinedWSEvent,
            data: { roomId: meetingId, userId },
          })
        );
        hasJoinedRef.current = true;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data);
      switch (msg.name) {
        case WSBoard.BoardUpdateWSEvent: {
          const d = msg.data;
          const { elements } = d.data;

          if (isDrawingRef.current || isEditingTextRef.current) {
            pendingSocketUpdateRef.current = elements ?? [];
          } else {
            try {
              isUpdatingFromSocketRef.current = true;
              excalidrawAPI.updateScene({
                elements: elements ?? [],
                captureUpdate: CaptureUpdateAction.IMMEDIATELY,
              });
              isUpdatingFromSocketRef.current = false;
            } catch (error) {
              console.error("Error updating scene from socket:", error);
              isUpdatingFromSocketRef.current = false;
            }
          }
          break;
        }
      }
    };

    const handleLeave = () => {
      if (!hasJoinedRef.current) return;
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            name: WSGeneral.UserLeftWSEvent,
            data: { roomId: meetingId, userId },
          })
        );
      }
      hasJoinedRef.current = false;
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);

    handleOpen();

    return () => {
      handleLeave();
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
    };
  }, [excalidrawAPI, meetingId, token, userId]);

  return (
    <div className="w-full h-full" ref={excalidrawContainerRef}>
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        onChange={handleChange}
        theme={theme}
        onPointerDown={handleLocalPointerDown}
        onPointerUp={handleLocalPointerUp}
        UIOptions={{
          tools: {
            image: false,
          },
        }}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
