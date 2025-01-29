import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export function RoomCard({ room, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
        isSelected && "bg-accent text-accent-foreground"
      )}
    >
      <MessageSquare className="h-4 w-4" />
      <div className="flex-1 text-left">
        <div className="font-medium">{room.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {room.description}
        </div>
      </div>
    </button>
  );
} 