"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SendHorizontal, Menu, Paperclip } from "lucide-react";
import { Navbar } from "@/components/chat/navbar";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageInput } from "@/components/chat/message-input";
import { FilePreview } from "@/components/chat/file-preview";
import { CreateRoomDialog } from "@/components/chat/create-room-dialog";

const SOCKET_URL = "http://10.40.51.240:80/ws";
const API_URL = "http://10.40.51.240:80/api";

export default function Home() {
  const [client, setClient] = useState(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();
  const subscriptions = useRef(new Map());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, []);

  const clearSubscriptions = useCallback(() => {
    if (subscriptions.current.size > 0) {
      subscriptions.current.forEach((subscription) => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
      subscriptions.current.clear();
    }
  }, []);

  const subscribeToRoom = useCallback((roomId = null) => {
    if (!client?.connected) return;

    console.log(`Conectando a sala: ${roomId ? `Sala ${roomId}` : 'General'}`);

    // Limpiar suscripciones anteriores
    clearSubscriptions();

    // Suscribirse a la sala
    const destination = roomId ? `/topic/room/${roomId}` : "/topic/public";
    console.log('Suscrito a:', destination);
    
    const chatSubscription = client.subscribe(destination, (message) => {
      const newMessage = JSON.parse(message.body);
      setMessages((prev) => [...prev, newMessage]);
    });
    subscriptions.current.set('chat', chatSubscription);

    // Suscribirse a actualizaciones de salas
    const roomsSubscription = client.subscribe("/topic/rooms", () => {
      fetchRooms();
    });
    subscriptions.current.set('rooms', roomsSubscription);

    // Suscribirse a actualizaciones de usuarios
    const usersSubscription = client.subscribe("/topic/users", (message) => {
      console.log('Recibida actualización de usuarios en sala:', message.body);
      const users = JSON.parse(message.body);
      setConnectedUsers(users.filter(user => user.username !== username));
    });
    subscriptions.current.set('users', usersSubscription);

    // Notificar unión a la sala
    const addUserEndpoint = roomId ? `/app/chat/${roomId}/addUser` : "/app/chat.addUser";
    client.publish({
      destination: addUserEndpoint,
      body: JSON.stringify({
        sender: username,
        type: "JOIN",
      }),
    });
  }, [client, username, fetchRooms, clearSubscriptions]);

  const subscribeToPrivateChat = useCallback((targetUser) => {
    if (!client?.connected) return;

    clearSubscriptions();

    // Suscribirse a mensajes privados
    const privateSubscription = client.subscribe(`/user/${username}/private`, (message) => {
      const newMessage = JSON.parse(message.body);
      setMessages((prev) => [...prev, newMessage]);
    });
    subscriptions.current.set('private', privateSubscription);

    // Suscribirse a actualizaciones de usuarios
    const usersSubscription = client.subscribe("/topic/users", (message) => {
      const users = JSON.parse(message.body);
      setConnectedUsers(users);
    });
    subscriptions.current.set('users', usersSubscription);
  }, [client, username, clearSubscriptions]);

  const connectToWebSocket = useCallback(() => {
    if (client?.connected) {
      client.deactivate();
    }

    console.log('Iniciando conexión WebSocket...');
    const newClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket conectado');
        setClient(newClient);
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket desconectado');
        setIsConnected(false);
        clearSubscriptions();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    newClient.activate();
  }, [client, clearSubscriptions]);

  // Efecto para manejar la suscripción inicial
  useEffect(() => {
    if (isConnected && client?.connected && username) {
      console.log('Iniciando suscripción inicial...');
      
      // Suscribirse a actualizaciones de usuarios
      const usersSubscription = client.subscribe("/topic/users", (message) => {
        console.log('Recibida actualización de usuarios:', message.body);
        const users = JSON.parse(message.body);
        setConnectedUsers(users.filter(user => user.username !== username));
      });
      subscriptions.current.set('users', usersSubscription);

      // Suscribirse a la sala general
      subscribeToRoom(null);

      // Solicitar lista inicial de usuarios
      client.publish({
        destination: "/app/users.get"
      });
    }
  }, [isConnected, client, username, subscribeToRoom]);

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...roomData, createdBy: username }),
      });
      const newRoom = await response.json();
      
      if (client?.connected) {
        client.publish({
          destination: "/app/rooms.update",
          body: JSON.stringify({ type: "CREATE" }),
        });
      }

      toast({
        title: "Sala creada",
        description: `La sala ${newRoom.name} ha sido creada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la sala.",
      });
    }
  };

  const handleSelectRoom = (room) => {
    console.log('Cambiando a sala:', room ? `${room.name} (ID: ${room.id})` : 'General');
    setSelectedRoom(room);
    setMessages([]);
    if (client?.connected) {
      subscribeToRoom(room?.id);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedRoom(null);
    setMessages([]);
    subscribeToPrivateChat(user);
  };

  const handleSendMessage = (messageData) => {
    if (!client?.connected) return;

    let destination;
    if (selectedRoom) {
      destination = `/app/chat/${selectedRoom.id}/sendMessage`;
    } else if (selectedUser) {
      destination = `/app/chat.private.${selectedUser.username}`;
    } else {
      destination = "/app/chat.sendMessage";
    }

    client.publish({
      destination,
      body: JSON.stringify({
        content: messageData.content,
        sender: username,
        type: messageData.type,
        hasAttachment: messageData.hasAttachment,
        fileId: messageData.fileId,
        fileName: messageData.fileName,
        fileType: messageData.fileType
      }),
    });
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un nombre de usuario",
      });
      return;
    }
    console.log('Iniciando proceso de conexión...');
    connectToWebSocket();
    fetchRooms();
  };

  const handleLogout = () => {
    if (client?.connected) {
      clearSubscriptions();
      client.deactivate();
    }
    setIsConnected(false);
    setUsername("");
    setMessages([]);
    setSelectedRoom(null);
    setClient(null);
  };

  useEffect(() => {
    return () => {
      if (client?.connected) {
        clearSubscriptions();
        client.deactivate();
      }
    };
  }, [client, clearSubscriptions]);

  if (!isConnected) {
    return (
      <div className="h-screen flex flex-col bg-gradient-secondary">
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleConnect} className="w-full max-w-sm space-y-4 p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center text-primary">Chat App</h1>
            <Input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full bg-gradient-primary text-white hover:opacity-90">
              Conectar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-secondary">
      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleConnect} className="w-full max-w-sm space-y-4 p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center text-primary">Chat App</h1>
            <Input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full bg-gradient-primary text-white hover:opacity-90">
              Conectar
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex h-[calc(100vh-1rem)] m-2 rounded-lg overflow-hidden bg-white shadow-xl">
          <main className="flex-1 flex flex-col min-w-0">
            <Navbar
              title={selectedRoom?.name || selectedUser || "Chat General"}
              onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4">
                {messages.map((message, i) => {
                  const isCurrentUser = message.sender === username;
                  if (message.type === "JOIN" || message.type === "LEAVE") {
                    return (
                      <div key={i} className="text-center text-sm text-muted-foreground">
                        {message.sender} {message.type === "JOIN" ? "se unió al" : "salió del"} chat
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={cn("flex gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%] break-words shadow-sm",
                          isCurrentUser
                            ? "bg-gradient-primary text-white"
                            : "bg-muted"
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.sender}
                          <span className="text-xs ml-2 opacity-70">{message.time}</span>
                        </div>
                        <div className="text-sm">
                          {message.content}
                          {message.hasAttachment && message.fileId && (
                            <FilePreview
                              fileId={message.fileId}
                              fileName={message.fileName}
                              fileType={message.fileType}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <footer className="border-t bg-white">
              <div className="max-w-3xl mx-auto w-full">
                <MessageInput onSendMessage={handleSendMessage} />
              </div>
            </footer>
          </main>
          <Sidebar
            rooms={rooms}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={() => setShowCreateRoomDialog(true)}
            selectedRoom={selectedRoom}
            connectedUsers={connectedUsers}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
            username={username}
          />
        </div>
      )}
      {showCreateRoomDialog && (
        <CreateRoomDialog
          open={showCreateRoomDialog}
          onOpenChange={setShowCreateRoomDialog}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  );
}


