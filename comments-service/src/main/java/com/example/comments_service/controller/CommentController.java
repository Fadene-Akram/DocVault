package com.example.comments_service.controller;

import com.example.comments_service.model.Comment;
import com.example.comments_service.model.CommentKey;
import com.example.comments_service.repository.CommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentRepository repository;

    public CommentController(CommentRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/list/{docId}")
    public List<Comment> list(@PathVariable String docId) {
        return repository.findByKeyDocId(UUID.fromString(docId));  // ← fixed
    }

    @PostMapping("/add")
    public Comment add(@RequestBody Comment comment) {
        comment.setCommentId(UUID.randomUUID());
        comment.setCreatedAt(Instant.now());
        return repository.save(comment);
    }

    @DeleteMapping("/{docId}/{commentId}")
    public ResponseEntity<Void> delete(
            @PathVariable String docId,
            @PathVariable String commentId) {
        repository.deleteById(new CommentKey(
                UUID.fromString(docId),
                UUID.fromString(commentId)
        ));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{docId}/{commentId}")
    public ResponseEntity<Comment> update(
            @PathVariable String docId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> body) {
        UUID docUUID     = UUID.fromString(docId);
        UUID commentUUID = UUID.fromString(commentId);

        List<Comment> comments = repository.findByKeyDocId(docUUID);  // ← fixed
        Comment existing = comments.stream()
                .filter(c -> c.getCommentId().equals(commentUUID))
                .findFirst()
                .orElse(null);

        if (existing == null) return ResponseEntity.notFound().build();

        existing.setContent(body.get("content"));
        return ResponseEntity.ok(repository.save(existing));
    }
}