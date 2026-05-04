//package com.example.document.controller;
//
//import com.example.document.model.Document;
//import com.example.document.service.DocumentService;
//import com.example.document.service.S3Service;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.time.Duration;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
//@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
//@RestController
//@RequestMapping("/documents")
//public class DocumentController {
//
//    private final DocumentService documentService;
//    private final S3Service s3Service;
//
//    public DocumentController(DocumentService documentService, S3Service s3Service) {
//        this.documentService = documentService;
//        this.s3Service = s3Service;
//    }
//
//    // ── List / get ────────────────────────────────────────────────────────────
//
//    @GetMapping("/list")
//    public List<Document> list() {
//        return documentService.getAllDocuments();
//    }
//
//    @GetMapping("/get/{id}")
//    public Document get(@PathVariable Long id) {
//        return documentService.getDocumentById(id).orElse(null);
//    }
//
//    // ── Pre-signed upload flow ─────────────────────────────────────────────
//    //
//    //  Step 1 — browser asks for a pre-signed PUT URL
//    //  POST /documents/presign
//    //  Body : { "fileName": "report.pdf", "contentType": "application/pdf" }
//    //  Reply: { "uploadUrl": "http://minio:9000/...", "objectKey": "documents/uuid-report.pdf", "downloadUrl": "..." }
//    //
//    @PostMapping("/presign")
//    public ResponseEntity<Map<String, String>> presign(@RequestBody Map<String, String> body) {
//        String fileName    = body.get("fileName");
//        String contentType = body.getOrDefault("contentType", "application/octet-stream");
//        String objectKey   = "documents/" + UUID.randomUUID() + "-" + fileName;
//
//        String uploadUrl   = s3Service.generateUploadUrl(objectKey, contentType, Duration.ofMinutes(15));
//        String downloadUrl = s3Service.generateDownloadUrl(objectKey, Duration.ofHours(1));
//
//        return ResponseEntity.ok(Map.of(
//                "uploadUrl",   uploadUrl,
//                "objectKey",   objectKey,
//                "downloadUrl", downloadUrl
//        ));
//    }
//
//    //  Step 2 — browser registers the document after the PUT succeeded
//    //  POST /documents/register
//    //  Body : { "title": "...", "fileName": "...", "fileSize": 12345, "contentType": "...", "s3Key": "documents/uuid-..." }
//    //
//    @PostMapping("/register")
//    public ResponseEntity<Document> register(@RequestBody Document document) {
//        Document saved = documentService.registerDocument(
//                document.getTitle(),
//                document.getFileName(),
//                document.getFileSize(),
//                document.getContentType(),
//                document.getS3Key()
//        );
//        return ResponseEntity.ok(saved);
//    }
//
//    // ── Classic multipart upload (kept for non-browser clients) ──────────────
//
//    @PostMapping("/upload")
//    public ResponseEntity<Document> upload(
//            @RequestParam("title") String title,
//            @RequestParam("file")  MultipartFile file) {
//        try {
//            return ResponseEntity.ok(documentService.uploadDocument(title, file));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }
//
//    // ── Download — pre-signed URL (browser ← MinIO directly) ─────────────────
//
//    @GetMapping("/{id}/download-url")
//    public ResponseEntity<String> downloadUrl(@PathVariable Long id) {
//        try {
//            String url = documentService.getDownloadUrl(id, Duration.ofHours(1));
//            return ResponseEntity.ok(url);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    // ── Download — bytes through Spring Boot (fallback / server-side use) ────
//
//    @GetMapping("/{id}/download")
//    public ResponseEntity<byte[]> download(@PathVariable Long id) {
//        try {
//            Document doc     = documentService.getDocumentById(id)
//                    .orElseThrow(() -> new RuntimeException("Not found"));
//            byte[]   content = documentService.downloadDocumentFile(id);
//            return ResponseEntity.ok()
//                    .header(HttpHeaders.CONTENT_TYPE, doc.getContentType())
//                    .header(HttpHeaders.CONTENT_DISPOSITION,
//                            "attachment; filename=\"" + doc.getFileName() + "\"")
//                    .body(content);
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    // ── Delete ────────────────────────────────────────────────────────────────
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<String> delete(@PathVariable Long id) {
//        try {
//            documentService.deleteDocument(id);
//            return ResponseEntity.ok("Deleted");
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
package com.example.document.controller;

import com.example.document.model.Document;
import com.example.document.service.DocumentService;
import com.example.document.service.S3Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final S3Service s3Service;

    public DocumentController(DocumentService documentService, S3Service s3Service) {
        this.documentService = documentService;
        this.s3Service = s3Service;
    }

    // ── List all ──────────────────────────────────────────────────────────────

    @GetMapping
    public List<Document> list() {
        return documentService.getAllDocuments();
    }

    // ── Get one ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<Document> get(@PathVariable Long id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Partial update (PATCH) ────────────────────────────────────────────────

    @PatchMapping("/{id}")
    public ResponseEntity<Document> patch(@PathVariable Long id,
                                          @RequestBody Map<String, Object> fields) {
        try {
            return ResponseEntity.ok(documentService.updateDocument(id, fields));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Pre-signed upload — Step 1: get PUT URL ───────────────────────────────

    @PostMapping("/presign")
    public ResponseEntity<Map<String, String>> presign(@RequestBody Map<String, String> body) {
        String fileName    = body.get("fileName");
        String contentType = body.getOrDefault("contentType", "application/octet-stream");
        String objectKey   = "documents/" + UUID.randomUUID() + "-" + fileName;

        String uploadUrl   = s3Service.generateUploadUrl(objectKey, contentType, Duration.ofMinutes(15));
        String downloadUrl = s3Service.generateDownloadUrl(objectKey, Duration.ofHours(1));

        return ResponseEntity.ok(Map.of(
                "uploadUrl",   uploadUrl,
                "objectKey",   objectKey,
                "downloadUrl", downloadUrl
        ));
    }

    // ── Pre-signed upload — Step 2: register after PUT ────────────────────────

    @PostMapping("/register")
    public ResponseEntity<Document> register(@RequestBody Map<String, Object> body) {
        try {
            Document saved = documentService.registerDocument(
                    (String) body.get("title"),
                    (String) body.get("description"),
                    (String) body.get("status"),
                    (String) body.get("categoryId"),
                    (String) body.get("departmentId"),
                    (String) body.get("authorId"),
                    (List<String>) body.get("tags"),
                    (String) body.get("currentVersion"),
                    (String) body.get("fileName"),
                    body.get("fileSize") instanceof Number
                            ? ((Number) body.get("fileSize")).longValue() : null,
                    (String) body.get("contentType"),
                    (String) body.get("s3Key"),
                    (String) body.get("downloadUrl")
            );
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── Download — pre-signed URL ─────────────────────────────────────────────

    @GetMapping("/{id}/download-url")
    public ResponseEntity<String> downloadUrl(@PathVariable Long id) {
        try {
            String url = documentService.getDownloadUrl(id, Duration.ofHours(1));
            return ResponseEntity.ok(url);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Download — bytes through Spring Boot ──────────────────────────────────

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        try {
            Document doc     = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Not found"));
            byte[]   content = documentService.downloadDocumentFile(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, doc.getContentType())
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + doc.getFileName() + "\"")
                    .body(content);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok("Deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}