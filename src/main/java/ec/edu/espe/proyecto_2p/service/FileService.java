package ec.edu.espe.proyecto_2p.service;

import ec.edu.espe.proyecto_2p.model.FileMessage;
import ec.edu.espe.proyecto_2p.repository.FileMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class FileService {
    
    @Autowired
    private FileMessageRepository fileMessageRepository;
    
    public FileMessage storeFile(MultipartFile file) throws IOException {
        FileMessage fileMessage = FileMessage.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .size(file.getSize())
                .data(file.getBytes())
                .build();
                
        return fileMessageRepository.save(fileMessage);
    }

    public void updateChatMessageId(Long fileId, Long chatMessageId) {
        FileMessage fileMessage = fileMessageRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
        fileMessage.setChatMessageId(chatMessageId);
        fileMessageRepository.save(fileMessage);
    }
    
    public FileMessage getFile(Long id) {
        return fileMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
    }
    
    public List<FileMessage> getFilesByChatMessageId(Long chatMessageId) {
        return fileMessageRepository.findByChatMessageId(chatMessageId);
    }
} 