//
//package com.example.document.model;
//
//import jakarta.persistence.*;
//import java.io.Serializable;
//import java.time.LocalDateTime;
//import java.util.List;
//import jakarta.persistence.FetchType;
//
//@Entity
//@Table(name = "documents")
//public class Document implements Serializable {
//    private static final long serialVersionUID = 1L;
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String title;
//    private String description;
//    private String status;         // "draft" | "published"
//
//
//
//    @Column(name = "category_id")
//    private String categoryId;
//
//    @Column(name = "department_id")
//    private String departmentId;
//
//    @Column(name = "author_id")
//    private String authorId;
//
//    @ElementCollection(fetch = FetchType.EAGER)
//    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
//    @Column(name = "tag")
//    private List<String> tags;
//
//    @Column(name = "current_version")
//    private String currentVersion;
//
//    @Column(name = "file_type")
//    private String fileType;
//
//    @Column(name = "file_size_display")
//    private String fileSizeDisplay;   // human-readable e.g. "1.2 MB"
//
//    // S3 / file fields
//    @Column(name = "s3_key", columnDefinition = "TEXT")
//    private String s3Key;
//
//    @Column(name = "file_name")
//    private String fileName;
//
//    @Column(name = "file_size")
//    private Long fileSize;            // raw bytes
//
//    @Column(name = "content_type")
//    private String contentType;
//
//    @Column(name = "download_url", columnDefinition = "TEXT")
//    private String downloadUrl;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    // ── Constructors ──────────────────────────────────────────────────────────
//
//    public Document() {}
//
//    public Document(String title) {
//        this.title = title;
//        this.createdAt = LocalDateTime.now();
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public Document(String title, String fileName, Long fileSize,
//                    String contentType, String s3Key) {
//        this.title = title;
//        this.fileName = fileName;
//        this.fileSize = fileSize;
//        this.contentType = contentType;
//        this.s3Key = s3Key;
//        this.createdAt = LocalDateTime.now();
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    // ── Getters & Setters ─────────────────────────────────────────────────────
//
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public String getDescription() { return description; }
//    public void setDescription(String description) { this.description = description; }
//
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//
//    public String getCategoryId() { return categoryId; }
//    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
//
//    public String getDepartmentId() { return departmentId; }
//    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
//
//    public String getAuthorId() { return authorId; }
//    public void setAuthorId(String authorId) { this.authorId = authorId; }
//
//    public List<String> getTags() { return tags; }
//    public void setTags(List<String> tags) { this.tags = tags; }
//
//    public String getCurrentVersion() { return currentVersion; }
//    public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }
//
//    public String getFileType() { return fileType; }
//    public void setFileType(String fileType) { this.fileType = fileType; }
//
//    public String getFileSizeDisplay() { return fileSizeDisplay; }
//    public void setFileSizeDisplay(String fileSizeDisplay) { this.fileSizeDisplay = fileSizeDisplay; }
//
//    public String getS3Key() { return s3Key; }
//    public void setS3Key(String s3Key) { this.s3Key = s3Key; }
//
//    public String getFileName() { return fileName; }
//    public void setFileName(String fileName) { this.fileName = fileName; }
//
//    public Long getFileSize() { return fileSize; }
//    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
//
//    public String getContentType() { return contentType; }
//    public void setContentType(String contentType) { this.contentType = contentType; }
//
//    public String getDownloadUrl() { return downloadUrl; }
//    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
//
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//
//    public LocalDateTime getUpdatedAt() { return updatedAt; }
//    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
//}

package com.example.document.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "documents")
public class Document implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "department_id")
    private String departmentId;

    @Column(name = "author_id")
    private String authorId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(name = "current_version")
    private String currentVersion;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size_display")
    private String fileSizeDisplay;

    @Column(name = "s3_key", columnDefinition = "TEXT")
    private String s3Key;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "download_url", columnDefinition = "TEXT")
    private String downloadUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Translation fields (NEW) ──────────────────────────────────────────────

    @Column(name = "translated_title")
    private String translatedTitle;

    @Column(name = "translated_description", columnDefinition = "TEXT")
    private String translatedDescription;

    @Column(name = "target_language")
    private String targetLanguage;

    @Column(name = "translated_at")
    private LocalDateTime translatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Document() {}

    public Document(String title) {
        this.title = title;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Document(String title, String fileName, Long fileSize,
                    String contentType, String s3Key) {
        this.title = title;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.s3Key = s3Key;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileSizeDisplay() { return fileSizeDisplay; }
    public void setFileSizeDisplay(String fileSizeDisplay) { this.fileSizeDisplay = fileSizeDisplay; }

    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ── Translation getters & setters (NEW) ───────────────────────────────────

    public String getTranslatedTitle() { return translatedTitle; }
    public void setTranslatedTitle(String translatedTitle) { this.translatedTitle = translatedTitle; }

    public String getTranslatedDescription() { return translatedDescription; }
    public void setTranslatedDescription(String translatedDescription) { this.translatedDescription = translatedDescription; }

    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }

    public LocalDateTime getTranslatedAt() { return translatedAt; }
    public void setTranslatedAt(LocalDateTime translatedAt) { this.translatedAt = translatedAt; }
}