//package com.example.document.event;
//
//public class DocumentUploadedEvent {
//
//    private Long documentId;
//    private String title;
//    private String fileName;
//    private String contentType;
//    private Long fileSize;
//    private String uploadedAt;  // ← changed from Instant to String
//
//    public DocumentUploadedEvent() {}
//
//    public DocumentUploadedEvent(Long documentId, String title, String fileName,
//                                 String contentType, Long fileSize) {
//        this.documentId = documentId;
//        this.title = title;
//        this.fileName = fileName;
//        this.contentType = contentType;
//        this.fileSize = fileSize;
//        this.uploadedAt = java.time.Instant.now().toString();  // ← ISO-8601 string
//    }
//
//    public Long getDocumentId() { return documentId; }
//    public void setDocumentId(Long documentId) { this.documentId = documentId; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public String getFileName() { return fileName; }
//    public void setFileName(String fileName) { this.fileName = fileName; }
//
//    public String getContentType() { return contentType; }
//    public void setContentType(String contentType) { this.contentType = contentType; }
//
//    public Long getFileSize() { return fileSize; }
//    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
//
//    public String getUploadedAt() { return uploadedAt; }      // ← String getter
//    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }  // ← String setter
//}

package com.example.document.event;

public class DocumentUploadedEvent {

    private Long documentId;
    private String title;
    private String description;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String uploadedAt;

    public DocumentUploadedEvent() {}

    public DocumentUploadedEvent(Long documentId, String title, String description,
                                 String fileName, String contentType, Long fileSize) {
        this.documentId = documentId;
        this.title = title;
        this.description = description;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = java.time.Instant.now().toString();
    }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }
}