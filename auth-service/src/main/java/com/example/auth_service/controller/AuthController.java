package com.example.auth_service.controller;

import com.example.auth_service.model.User;
import com.example.auth_service.service.UserService;
import com.example.auth_service.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        return userService.findByEmail(email)
                .filter(u -> userService.checkPassword(password, u.getPassword()))
                .map(u -> {
                    userService.updateLastLogin(u);
                    String token = jwtUtil.generateToken(u.getEmail(), u.getRoles());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "email", u.getEmail(),
                            "roles", u.getRoles()
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        try {
            String email    = (String) body.get("email");
            String password = (String) body.get("password");
            List<String> roles = body.containsKey("roles")
                    ? (List<String>) body.get("roles")
                    : List.of("ROLE_USER");

            User user = userService.register(email, password, roles);
            return ResponseEntity.ok(Map.of(
                    "id",    user.getId(),
                    "email", user.getEmail(),
                    "roles", user.getRoles()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body(Map.of("error", "Missing token"));

        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        var claims = jwtUtil.extractClaims(token);
        return ResponseEntity.ok(Map.of(
                "email", claims.getSubject(),
                "roles", claims.get("roles")
        ));
    }
}