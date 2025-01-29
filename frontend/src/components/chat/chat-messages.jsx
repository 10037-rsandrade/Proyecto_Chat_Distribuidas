import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ChatMessages({ messages, currentUser }) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages?.map((message, i) => {
          const isCurrentUser = message.sender === currentUser;
          if (message.type === "JOIN" || message.type === "LEAVE") {
            return (
              <div
                key={i}
                className="text-center text-sm text-muted-foreground"
              >
                {message.sender} {message.type === "JOIN" ? "se unió" : "salió"} de la sala
              </div>
            );
          }
          return (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%] break-words",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender}
                  <span className="text-xs ml-2 opacity-70">
                    {message.time}
                  </span>
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
} 