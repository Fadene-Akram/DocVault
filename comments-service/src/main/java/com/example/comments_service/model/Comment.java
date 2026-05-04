
package com.example.comments_service.model;

import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Table;

import java.util.UUID;
import java.time.Instant;

@Table("comments")
public class Comment {

    @PrimaryKey
    private CommentKey key;

    @Column("content")
    private String content;

    @Column("author")
    private String author;

    @Column("created_at")
    private Instant createdAt;      // ← add this

    public Comment() {}

    public Comment(UUID docId, UUID commentId, String content, String author) {
        this.key     = new CommentKey(docId, commentId);
        this.content = content;
        this.author  = author;
        this.createdAt = Instant.now();
    }

    // Convenience getters so the controller and api.js normalisation still work
    public UUID getDocId()      { return key != null ? key.getDocId()     : null; }
    public UUID getCommentId()  { return key != null ? key.getCommentId() : null; }

    public void setDocId(UUID docId) {
        if (key == null) key = new CommentKey(docId, null);
        else key = new CommentKey(docId, key.getCommentId());
    }

    public void setCommentId(UUID commentId) {
        if (key == null) key = new CommentKey(null, commentId);
        else key = new CommentKey(key.getDocId(), commentId);
    }

    public CommentKey getKey()  { return key; }
    public void setKey(CommentKey key) { this.key = key; }

    public String getContent()  { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor()   { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Instant getCreatedAt()            { return createdAt; }
    public void    setCreatedAt(Instant t)   { this.createdAt = t; }
}