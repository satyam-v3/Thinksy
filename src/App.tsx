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

import { useChats } from "./hooks/useChats";

import { useTheme } from "./hooks/useTheme";

import {
  describeError,
  streamChatQuery,
} from "./lib/api";

import { storage } from "./lib/storage";

import type {
  Message,
  Source,
  UploadedDoc,
} from "./lib/types";

export default function App() {
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

  useEffect(() => {
    storage.saveDocs(docs);
  }, [docs]);

  const handleSend = async (
    text: string
  ) => {
    const chat = ensureActive();

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

      await streamChatQuery(
        {
          query: text,
          history,
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
        open={sidebarOpen}
        setOpen={
          setSidebarOpen
        }
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatArea
          chat={activeChat}
          onSend={
            handleSend
          }
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
          loading={loading}
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