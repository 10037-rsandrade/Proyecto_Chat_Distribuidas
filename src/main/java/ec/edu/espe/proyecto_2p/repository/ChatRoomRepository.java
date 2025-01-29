package ec.edu.espe.proyecto_2p.repository;

import ec.edu.espe.proyecto_2p.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
} 