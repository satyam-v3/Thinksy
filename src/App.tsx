import {
  useEffect,
  useState,
} from "react";

import { v4 as uuid } from "uuid";

import {
  Toaster,
  toast,
} from "sonner";

import { ChatArea } from "./components/ChatArea";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./components/Login"; // 👈 Import the Login component

import { useChats } from "./hooks/useChats";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./context/AuthContext"; // 👈 Import your Auth Context

import {
  describeError,
  streamChatQuery,
  addMessage,
  updateChatTitle,
} from "./lib/api";

import { storage } from "./lib/storage";

import type {
  Message,
  UploadedDoc,
} from "./lib/types";

// ─────────────────────────────────────────────
// 1. YOUR ORIGINAL APP LOGIC (Now called ChatApp)
// ─────────────────────────────────────────────
function ChatApp() {
  const { theme } = useTheme();

  const {
    chats,
    activeChat,
    activeId,
    setActiveId,
    newChat,
    ensureActive,
    appendMessage,
    updateMessage,
    deleteChat,
    renameChat,
  } = useChats();

  const [docs, setDocs] =
    useState<UploadedDoc[]>(() =>
      storage.loadDocs()
    );

  const [sidebarOpen, setSidebarOpen] =
    useState<boolean>(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return true;
      }

      return (
        window.innerWidth >= 1024
      );
    });

  const [loading, setLoading] =
    useState(false);

  const toggleDocActive = (
    id: string,
  ) => {
    setDocs((prev) =>
      prev.map((doc) => ({
        ...doc,
        active: doc.id === id,
      })),
    );
  };

  useEffect(() => {
    storage.saveDocs(docs);
  }, [docs]);

  const handleSend = async (
    text: string
  ) => {
    const chat = await ensureActive();

    const userMsg: Message = {
      id: uuid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const assistantId = uuid();

    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      pending: true,
    };

    appendMessage(
      chat.id,
      userMsg
    );

    if (
      chat.title === "New Chat"
    ) {
      const newTitle =
        text.slice(0, 60);

      renameChat(
        chat.id,
        newTitle,
      );

      void updateChatTitle(
        chat.id,
        newTitle,
      );
    }

    await addMessage(
      chat.id,
      "user",
      text,
    );

    appendMessage(
      chat.id,
      assistantMsg
    );

    setLoading(true);

    try {
      const history =
        chat.messages
          .filter(
            (m) =>
              !m.error &&
              (m.content || "")
                .trim()
          )
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

      let streamedText = '';

      let frame: number | null =
        null;

      const flushUpdate = () => {
        updateMessage(
          chat.id,
          assistantId,
          {
            content:
              streamedText,

            pending: true,
          },
        );

        frame = null;
      };

      const activeDocs =
        docs
          .filter(
            (d) => d.active,
          )
          .map(
            (d) =>
              d.storedFilename ??
              d.filename,
          );

      await streamChatQuery(
        {
          query: text,
          history,
          activeDocs,
        },

        {
          onToken(token) {
            streamedText += token;

            if (!frame) {
              frame =
                requestAnimationFrame(
                  flushUpdate,
                );
            }
          },

          onDone(sources) {
            if (frame) {
              cancelAnimationFrame(
                frame,
              );
            }

            updateMessage(
              chat.id,
              assistantId,
              {
                content:
                  streamedText,

                sources,

                pending: false,
              },
            );

            void addMessage(
              chat.id,
              "assistant",
              streamedText,
            );
          },
        },
      );

    } catch (e) {
      const msg =
        describeError(e);

      updateMessage(
        chat.id,
        assistantId,
        {
          pending: false,
          error: msg,
          content: "",
        },
      );

      toast.error(msg);

    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    newChat();

    if (
      window.innerWidth < 1024
    ) {
      setSidebarOpen(false);
    }
  };

  const handleSelect = (
    id: string
  ) => {
    setActiveId(id);

    if (
      window.innerWidth < 1024
    ) {
      setSidebarOpen(false);
    }
  };

  const activeDocs =
    docs
      .filter(
        (d) => d.active,
      )
      .map(
        (d) =>
          d.storedFilename ??
          d.filename,
      );

  return (
    <div className="grain flex h-screen w-screen overflow-hidden bg-bg text-fg">
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={
          handleSelect
        }
        onNew={handleNew}
        onDelete={
          deleteChat
        }
        docs={docs}
        onDocsChange={
          setDocs
        }
        onToggleDoc={
          toggleDocActive
        }
        open={sidebarOpen}
        setOpen={
          setSidebarOpen
        }
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatArea
          chat={activeChat}
          onSend={handleSend}
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
          loading={loading}
          activeDocs={activeDocs}
        />
      </main>

      <Toaster
        position="top-right"
        theme={theme}
        toastOptions={{
          style: {
            background:
              "rgb(var(--surface))",

            color:
              "rgb(var(--fg))",

            border:
              "1px solid rgb(var(--border))",
          },
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. THE NEW AUTHENTICATION WRAPPER
// ─────────────────────────────────────────────
export default function App() {
  const { user, isLoading } = useAuth();

  // Show a blank screen or loading spinner while checking local storage
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-fg">
        <div className="text-lg opacity-50">Loading Thinksy...</div>
      </div>
    );
  }

  // If there is no authenticated user, block access and render the Login screen
  if (!user) {
    return <Login />;
  }

  // If they are logged in, render the actual application!
  return <ChatApp />;
}