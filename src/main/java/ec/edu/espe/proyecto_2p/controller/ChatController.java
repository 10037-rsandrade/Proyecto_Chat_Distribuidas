package ec.edu.espe.proyecto_2p.controller;

import ec.edu.espe.proyecto_2p.model.ChatMessage;
import ec.edu.espe.proyecto_2p.model.FileMessage;
import ec.edu.espe.proyecto_2p.service.UserService;
import ec.edu.espe.proyecto_2p.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserService userService;
    private final FileService fileService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        
        if (chatMessage.isHasAttachment() && chatMessage.getFileId() != null) {
            try {
                fileService.updateChatMessageId(chatMessage.getFileId(), chatMessage.getId());
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error updating file message: " + e.getMessage());
            }
        }
        
        return chatMessage;
    }

    @MessageMapping("/chat/{roomId}/sendMessage")
    public ChatMessage sendRoomMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        chatMessage.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        
        if (chatMessage.isHasAttachment() && chatMessage.getFileId() != null) {
            try {
                fileService.updateChatMessageId(chatMessage.getFileId(), chatMessage.getId());
            } catch (Exception e) {
                System.err.println("Error updating file message: " + e.getMessage());
            }
        }
        
        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.private.{username}")
    public ChatMessage sendPrivateMessage(@DestinationVariable String username, @Payload ChatMessage chatMessage) {
        chatMessage.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        
        if (chatMessage.isHasAttachment() && chatMessage.getFileId() != null) {
            try {
                fileService.updateChatMessageId(chatMessage.getFileId(), chatMessage.getId());
            } catch (Exception e) {
                System.err.println("Error updating file message: " + e.getMessage());
            }
        }
        
        messagingTemplate.convertAndSend("/user/" + username + "/private", chatMessage);
        messagingTemplate.convertAndSend("/user/" + chatMessage.getSender() + "/private", chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        String sessionId = headerAccessor.getSessionId();
        
        headerAccessor.getSessionAttributes().put("username", username);
        userService.addUser(username, sessionId);
        messagingTemplate.convertAndSend("/topic/users", userService.getConnectedUsers());
        
        chatMessage.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        return chatMessage;
    }

    @MessageMapping("/chat/{roomId}/addUser")
    public ChatMessage addRoomUser(@DestinationVariable String roomId, ChatMessage chatMessage, 
                                 SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        String sessionId = headerAccessor.getSessionId();
        
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("room_id", roomId);
        userService.addUser(username, sessionId);
        
        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
        messagingTemplate.convertAndSend("/topic/users", userService.getConnectedUsers());
        return chatMessage;
    }

    @MessageMapping("/rooms.update")
    public void handleRoomUpdate() {
        messagingTemplate.convertAndSend("/topic/rooms", "update");
    }

    @MessageMapping("/users.get")
    public void getConnectedUsers() {
        messagingTemplate.convertAndSend("/topic/users", userService.getConnectedUsers());
    }

    @PostMapping("/api/files/upload")
    public ResponseEntity<FileMessage> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileMessage fileMessage = fileService.storeFile(file);
            return ResponseEntity.ok(fileMessage);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/files/{fileId}/chat/{chatMessageId}")
    public ResponseEntity<Void> updateFileMessageId(
        @PathVariable Long fileId,
        @PathVariable Long chatMessageId
    ) {
        try {
            fileService.updateChatMessageId(fileId, chatMessageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/api/files/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        FileMessage fileMessage = fileService.getFile(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileMessage.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileMessage.getFileName() + "\"")
                .body(new ByteArrayResource(fileMessage.getData()));
    }
} 