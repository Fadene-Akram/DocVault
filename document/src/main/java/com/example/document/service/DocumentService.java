//
//package com.example.document.service;
//
//import com.example.document.event.DocumentEventProducer;
//import com.example.document.event.DocumentUploadedEvent;
//import com.example.document.model.Document;
//import com.example.document.repository.DocumentRepository;
//import org.springframework.cache.annotation.CacheEvict;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.time.Duration;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Service
//public class DocumentService {
//
//    private final DocumentRepository documentRepository;
//    private final S3Service s3Service;
//    private final DocumentEventProducer eventProducer;
//
//    public DocumentService(DocumentRepository documentRepository,
//                           S3Service s3Service,
//                           DocumentEventProducer eventProducer) {
//        this.documentRepository = documentRepository;
//        this.s3Service = s3Service;
//        this.eventProducer = eventProducer;
//    }
//
//    // ── Classic multipart upload (file goes through Spring Boot) ─────────────
//
//    public Document uploadDocument(String title, MultipartFile file) throws IOException {
//        String key = generateKey(file.getOriginalFilename());
//        s3Service.uploadFile(key, file.getBytes());
//
//        Document doc = new Document(title, file.getOriginalFilename(),
//                file.getSize(), file.getContentType(), key);
//        Document saved = documentRepository.save(doc);
//        publishEvent(saved);
//        return saved;
//    }
//
//    // ── Pre-signed flow: register after browser PUT directly to MinIO ─────────
//
//    public Document registerDocument(String title, String fileName,
//                                     Long fileSize, String contentType, String s3Key) {
//        Document doc = new Document(title, fileName, fileSize, contentType, s3Key);
//        Document saved = documentRepository.save(doc);
//        publishEvent(saved);
//        return saved;
//    }
//
//    // ── Read ──────────────────────────────────────────────────────────────────
//
//    public List<Document> getAllDocuments() {
//        return documentRepository.findAll();
//    }
//
//    @Cacheable(value = "documents", key = "#id")
//    public Optional<Document> getDocumentById(Long id) {
//        return documentRepository.findById(id);
//    }
//
//    // ── Metadata-only creation (no file) ──────────────────────────────────────
//
//    public Document createDocument(String title) {
//        Document doc = new Document(title);
//        return documentRepository.save(doc);
//    }
//
//    // ── Download bytes through Spring Boot ───────────────────────────────────
//
//    public byte[] downloadDocumentFile(Long id) {
//        Document doc = documentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
//        if (doc.getS3Key() == null)
//            throw new RuntimeException("Document has no file attached");
//        return s3Service.downloadFile(doc.getS3Key());
//    }
//
//    // ── Fresh pre-signed download URL ────────────────────────────────────────
//
//    public String getDownloadUrl(Long id, Duration expiry) {
//        Document doc = documentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
//        if (doc.getS3Key() == null)
//            throw new RuntimeException("Document has no file attached");
//        return s3Service.generateDownloadUrl(doc.getS3Key(), expiry);
//    }
//
//    // ── Delete ────────────────────────────────────────────────────────────────
//
//    @CacheEvict(value = "documents", key = "#id")
//    public void deleteDocument(Long id) {
//        Document doc = documentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
//        if (doc.getS3Key() != null) s3Service.deleteFile(doc.getS3Key());
//        documentRepository.deleteById(id);
//    }
//
//    // ── Helpers ───────────────────────────────────────────────────────────────
//
//    private String generateKey(String originalFileName) {
//        return "documents/" + UUID.randomUUID() + "-" + originalFileName;
//    }
//
//    private void publishEvent(Document doc) {
//        eventProducer.publishUploadedEvent(new DocumentUploadedEvent(
//                doc.getId(), doc.getTitle(), doc.getFileName(),
//                doc.getContentType(), doc.getFileSize()));
//    }
//}
package com.example.document.service;

import com.example.document.event.DocumentEventProducer;
import com.example.document.event.DocumentUploadedEvent;
import com.example.document.model.Document;
import com.example.document.repository.DocumentRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final S3Service s3Service;
    private final DocumentEventProducer eventProducer;

    public DocumentService(DocumentRepository documentRepository,
                           S3Service s3Service,
                           DocumentEventProducer eventProducer) {
        this.documentRepository = documentRepository;
        this.s3Service = s3Service;
        this.eventProducer = eventProducer;
    }

    // ── Classic multipart upload (file goes through Spring Boot) ─────────────

    public Document uploadDocument(String title, MultipartFile file) throws IOException {
        String key = generateKey(file.getOriginalFilename());
        s3Service.uploadFile(key, file.getBytes());

        Document doc = new Document(title, file.getOriginalFilename(),
                file.getSize(), file.getContentType(), key);
        doc.setFileSizeDisplay(formatBytes(file.getSize()));
        doc.setFileType(fileExtension(file.getOriginalFilename()));
        doc.setStatus("draft");
        doc.setCurrentVersion("1.0.0");
        Document saved = documentRepository.save(doc);
        publishEvent(saved);
        return saved;
    }

    // ── Pre-signed flow: register after browser PUT directly to MinIO ─────────

    public Document registerDocument(String title, String description, String status,
                                     String categoryId, String departmentId, String authorId,
                                     List<String> tags, String currentVersion,
                                     String fileName, Long fileSize, String contentType,
                                     String s3Key, String downloadUrl) {
        Document doc = new Document();
        doc.setTitle(title);
        doc.setDescription(description);
        doc.setStatus(status != null ? status : "draft");
        doc.setCategoryId(categoryId);
        doc.setDepartmentId(departmentId);
        doc.setAuthorId(authorId);
        doc.setTags(tags);
        doc.setCurrentVersion(currentVersion != null ? currentVersion : "1.0.0");
        doc.setFileName(fileName);
        doc.setFileSize(fileSize);
        doc.setFileSizeDisplay(formatBytes(fileSize));
        doc.setFileType(fileExtension(fileName));
        doc.setContentType(contentType);
        doc.setS3Key(s3Key);
        doc.setDownloadUrl(downloadUrl);
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());

        Document saved = documentRepository.save(doc);
        publishEvent(saved);
        return saved;
    }

    // ── Partial update (PATCH) ────────────────────────────────────────────────

    public Document updateDocument(Long id, Map<String, Object> fields) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));

        if (fields.containsKey("title"))
            doc.setTitle((String) fields.get("title"));
        if (fields.containsKey("description"))
            doc.setDescription((String) fields.get("description"));
        if (fields.containsKey("status"))
            doc.setStatus((String) fields.get("status"));
        if (fields.containsKey("categoryId"))
            doc.setCategoryId((String) fields.get("categoryId"));
        if (fields.containsKey("departmentId"))
            doc.setDepartmentId((String) fields.get("departmentId"));
        if (fields.containsKey("currentVersion"))
            doc.setCurrentVersion((String) fields.get("currentVersion"));
        if (fields.containsKey("tags"))
            doc.setTags((List<String>) fields.get("tags"));

        doc.setUpdatedAt(LocalDateTime.now());
        return documentRepository.save(doc);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Cacheable(value = "documents", key = "#id")
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    // ── Metadata-only creation (no file) ──────────────────────────────────────

    public Document createDocument(String title) {
        Document doc = new Document(title);
        return documentRepository.save(doc);
    }

    // ── Download bytes through Spring Boot ───────────────────────────────────

    public byte[] downloadDocumentFile(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        if (doc.getS3Key() == null)
            throw new RuntimeException("Document has no file attached");
        return s3Service.downloadFile(doc.getS3Key());
    }

    // ── Fresh pre-signed download URL ────────────────────────────────────────

    public String getDownloadUrl(Long id, Duration expiry) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        if (doc.getS3Key() == null)
            throw new RuntimeException("Document has no file attached");
        return s3Service.generateDownloadUrl(doc.getS3Key(), expiry);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @CacheEvict(value = "documents", key = "#id")
    public void deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        if (doc.getS3Key() != null) s3Service.deleteFile(doc.getS3Key());
        documentRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateKey(String originalFileName) {
        return "documents/" + UUID.randomUUID() + "-" + originalFileName;
    }

    private String formatBytes(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    private String fileExtension(String fileName) {
        if (fileName == null) return "FILE";
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot + 1).toUpperCase() : "FILE";
    }

//    private void publishEvent(Document doc) {
//        eventProducer.publishUploadedEvent(new DocumentUploadedEvent(
//                doc.getId(), doc.getTitle(), doc.getFileName(),
//                doc.getContentType(), doc.getFileSize()));
//    }
private void publishEvent(Document doc) {
    eventProducer.publishUploadedEvent(new DocumentUploadedEvent(
            doc.getId(),
            doc.getTitle(),
            doc.getDescription(),   // ← added
            doc.getFileName(),
            doc.getContentType(),
            doc.getFileSize()));
}
}