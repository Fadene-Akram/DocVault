//package com.example.comments_service.repository;
//
//import com.example.comments_service.model.Comment;
//import org.springframework.data.cassandra.repository.CassandraRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.UUID;
//
//@Repository
//public interface CommentRepository extends CassandraRepository<Comment, UUID> {
//    List<Comment> findByDocId(UUID docId);
//}
package com.example.comments_service.repository;

import com.example.comments_service.model.Comment;
import com.example.comments_service.model.CommentKey;
import org.springframework.data.cassandra.repository.CassandraRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends CassandraRepository<Comment, CommentKey> {
    List<Comment> findByKeyDocId(UUID docId);   // Spring Data derives this from CommentKey.docId
}