import { Button } from "@/components/ui/button";
import { MessageSquare, LogOut } from "lucide-react";

export function Navbar({ onLogout, username }) {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-lg font-semibold">Chat App</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
             <span className="font-medium text-foreground">{username}</span>
          </span>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
} 