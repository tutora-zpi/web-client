"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  MemoExoticComponent,
  JSX,
} from "react";
import {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import {
  OrderedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/element/types";
import { useTheme } from "next-themes";
import { WSConnect } from "@/lib/websocket/ws-connect";
import { WSBoard, WSGeneral } from "@/types/websocket";

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

  useEffect(() => {
    if (!themeMode) return;

    setTheme((themeMode as string) === "dark" ? "dark" : "light");
  }, [themeMode]);

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
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

      socketRef.current.send(
        JSON.stringify({
          name: WSBoard.BoardUpdateWSEvent,
          data: {
            meetingId,
            data: {
              elements: elementsRef.current,
            },
          },
        })
      );

      elementsRef.current = null;
    };

    const container = excalidrawContainerRef.current;
    if (!container) return;

    container.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

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
          console.log(d.data);
          const { elements, appState } = d.data;
          try {
            isUpdatingFromSocketRef.current = true;
            excalidrawAPI.updateScene({
              elements: elements ?? [],
            });

            isUpdatingFromSocketRef.current = false;
          } catch (error) {
            console.error("Error updating scene:", error);
            isUpdatingFromSocketRef.current = false;
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
  }, [excalidrawAPI]);

  return (
    <div className="w-full h-full" ref={excalidrawContainerRef}>
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        onChange={handleChange}
        theme={theme}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
