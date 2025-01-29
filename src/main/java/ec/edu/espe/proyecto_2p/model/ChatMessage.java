package ec.edu.espe.proyecto_2p.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private MessageType type;
    private String content;
    private String sender;
    private String time;
    private boolean hasAttachment;
    private Long fileId;
    private String fileName;
    private String fileType;
    
    @OneToMany(mappedBy = "chatMessageId", cascade = CascadeType.ALL)
    private List<FileMessage> attachments;

    public enum MessageType {
        CHAT,
        FILE,
        JOIN,
        LEAVE
    }
} 