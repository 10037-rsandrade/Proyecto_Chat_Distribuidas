package ec.edu.espe.proyecto_2p.service;

import ec.edu.espe.proyecto_2p.model.ConnectedUser;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final ConcurrentHashMap<String, ConnectedUser> connectedUsers = new ConcurrentHashMap<>();

    public void addUser(String username, String sessionId) {
        connectedUsers.put(sessionId, new ConnectedUser(username, sessionId));
    }

    public void removeUser(String sessionId) {
        connectedUsers.remove(sessionId);
    }

    public List<ConnectedUser> getConnectedUsers() {
        return new ArrayList<>(connectedUsers.values());
    }

    public String getUsernameBySessionId(String sessionId) {
        ConnectedUser user = connectedUsers.get(sessionId);
        return user != null ? user.getUsername() : null;
    }
} 