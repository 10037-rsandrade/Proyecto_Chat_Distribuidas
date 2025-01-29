import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateRoomDialog } from "./create-room-dialog";
import { cn } from "@/lib/utils";
import { MessageSquare, Hash, Users, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Sidebar({
  rooms,
  onSelectRoom,
  onCreateRoom,
  selectedRoom,
  connectedUsers,
  onSelectUser,
  selectedUser,
  username,
}) {
  const [activeTab, setActiveTab] = useState("rooms");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (connectedUsers) {
      setUserCount(connectedUsers.length);
    }
  }, [connectedUsers]);

  return (
    <aside className="w-80 border-l bg-gradient-secondary">
      <div className="p-4">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-2">Salas de Chat</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-gradient-primary hover:text-white transition-all"
                onClick={() => onSelectRoom(null)}
              >
                <Hash className="h-4 w-4" />
                General
              </Button>
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant={selectedRoom?.id === room.id ? "secondary" : "outline"}
                  className="w-full justify-start gap-2 hover:bg-gradient-primary hover:text-white transition-all"
                  onClick={() => onSelectRoom(room)}
                >
                  <Hash className="h-4 w-4" />
                  {room.name}
                </Button>
              ))}
              <Button
                variant="outline"
                className="w-full bg-gradient-primary text-white hover:opacity-90"
                onClick={onCreateRoom}
              >
                Crear Sala
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-2">Usuarios Conectados</h2>
            <div className="space-y-2">
              {connectedUsers
                .filter((user) => user.username !== username)
                .map((user) => (
                  <Button
                    key={user.sessionId}
                    variant={selectedUser?.sessionId === user.sessionId ? "secondary" : "outline"}
                    className="w-full justify-start gap-2 hover:bg-gradient-primary hover:text-white transition-all"
                    onClick={() => onSelectUser(user)}
                  >
                    <User className="h-4 w-4" />
                    {user.username}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 