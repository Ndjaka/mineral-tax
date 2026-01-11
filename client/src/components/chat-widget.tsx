import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMessage += data.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#003366] hover:bg-[#002244] z-50"
          size="icon"
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card
          className="fixed bottom-6 right-6 w-[360px] h-[500px] flex flex-col shadow-xl z-50 overflow-hidden"
          data-testid="chat-widget"
        >
          <div className="flex items-center justify-between p-3 border-b bg-[#003366]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{t.chatWidget?.title || "Assistant MineralTax"}</h3>
                <p className="text-white/70 text-xs">{t.chatWidget?.subtitle || "Posez vos questions"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
              data-testid="button-close-chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p className="mb-2">{t.chatWidget?.welcome || "Bonjour ! Comment puis-je vous aider ?"}</p>
                <p className="text-xs">
                  {t.chatWidget?.hint || "Posez-moi vos questions sur le remboursement de l'impôt sur les huiles minérales."}
                </p>
              </div>
            )}
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-[#003366] text-white"
                        : "bg-muted"
                    }`}
                    data-testid={`chat-message-${msg.role}-${idx}`}
                  >
                    {msg.content || (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chatWidget?.placeholder || "Votre message..."}
                className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px] max-h-[80px]"
                rows={1}
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-[#003366] hover:bg-[#002244]"
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
