package ec.edu.espe.proyecto_2p.repository;

import ec.edu.espe.proyecto_2p.model.FileMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileMessageRepository extends JpaRepository<FileMessage, Long> {
    List<FileMessage> findByChatMessageId(Long chatMessageId);
} 