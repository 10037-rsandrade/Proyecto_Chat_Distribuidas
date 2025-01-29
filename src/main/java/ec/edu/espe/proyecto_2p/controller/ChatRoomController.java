package ec.edu.espe.proyecto_2p.controller;

import ec.edu.espe.proyecto_2p.model.ChatRoom;
import ec.edu.espe.proyecto_2p.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;

    @PostMapping
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoom chatRoom) {
        return ResponseEntity.ok(chatRoomRepository.save(chatRoom));
    }

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {
        return ResponseEntity.ok(chatRoomRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        chatRoomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 