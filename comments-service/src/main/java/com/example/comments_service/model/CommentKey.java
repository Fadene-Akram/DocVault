package com.example.comments_service.model;

import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyClass;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.cql.Ordering;

import java.io.Serializable;
import java.util.UUID;

@PrimaryKeyClass
public class CommentKey implements Serializable {

    @PrimaryKeyColumn(name = "doc_id", type = PrimaryKeyType.PARTITIONED)
    private UUID docId;

    @PrimaryKeyColumn(name = "comment_id", type = PrimaryKeyType.CLUSTERED, ordering = Ordering.DESCENDING)
    private UUID commentId;

    public CommentKey() {}

    public CommentKey(UUID docId, UUID commentId) {
        this.docId = docId;
        this.commentId = commentId;
    }

    public UUID getDocId()     { return docId; }
    public UUID getCommentId() { return commentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommentKey)) return false;
        CommentKey k = (CommentKey) o;
        return java.util.Objects.equals(docId, k.docId) &&
                java.util.Objects.equals(commentId, k.commentId);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(docId, commentId);
    }
}