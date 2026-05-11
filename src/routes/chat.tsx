import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  component: () => (
    <RequireAuth>
      <AdminLayout>
        <ChatPage />
      </AdminLayout>
    </RequireAuth>
  ),
});

interface Message {
  id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

const NAME_KEY = "chat_display_name";

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial name (admin by default)
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(NAME_KEY) : null;
    setName(stored || "Admin");
  }, []);

  // Load + subscribe
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (!active) return;
      if (error) toast.error(error.message);
      else setMessages((data ?? []) as Message[]);
    })();

    const channel = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const role = name.trim().toLowerCase() === "admin" ? "admin" : "member";
    const { error } = await supabase.from("messages").insert({
      sender_name: name.trim() || "Anonymous",
      sender_role: role,
      content,
    });
    if (error) {
      toast.error(error.message);
      setText(content);
    }
  };

  const saveName = () => {
    const v = nameDraft.trim();
    if (!v) return;
    localStorage.setItem(NAME_KEY, v);
    setName(v);
    setEditingName(false);
  };

  return (
    <>
      <PageHeader
        title="Team Chat"
        description="Real-time conversation between admin and camp managers."
        actions={
          editingName ? (
            <div className="flex gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Display name"
                className="w-48"
                onKeyDown={(e) => e.key === "Enter" && saveName()}
              />
              <Button size="sm" onClick={saveName}>Save</Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setNameDraft(name); setEditingName(true); }}
            >
              Posting as: {name}
            </Button>
          )
        }
      />

      <Card className="flex flex-col h-[calc(100vh-220px)] overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-20">
              <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No messages yet. Say hello to your team.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const mine = m.sender_name === name;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">
                          {m.sender_name}
                          {m.sender_role === "admin" && (
                            <span className="ml-1 text-[10px] uppercase tracking-wider opacity-70">
                              admin
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={!text.trim()}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </Card>
    </>
  );
}
