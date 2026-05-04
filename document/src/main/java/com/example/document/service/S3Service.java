
// package com.example.document.service;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;

// import java.io.File;
// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class S3Service {

//     @Value("${app.file.storage-path:/data/documents}")
//     private String storagePath;

//     /**
//      * Upload file to local storage
//      */
//     public String uploadFile(String key, byte[] content) {
//         try {
//             Path filePath = Paths.get(storagePath, key);
            
//             // Create directories if they don't exist
//             Files.createDirectories(filePath.getParent());
            
//             // Write file
//             Files.write(filePath, content);
            
//             return key;
//         } catch (IOException e) {
//             throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
//         }
//     }

//     /**
//      * Download file from local storage
//      */
//     public byte[] downloadFile(String key) {
//         try {
//             Path filePath = Paths.get(storagePath, key);
            
//             if (!Files.exists(filePath)) {
//                 throw new RuntimeException("File not found: " + key);
//             }
            
//             return Files.readAllBytes(filePath);
//         } catch (IOException e) {
//             throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
//         }
//     }

//     /**
//      * Delete file from local storage
//      */
//     public void deleteFile(String key) {
//         try {
//             Path filePath = Paths.get(storagePath, key);
            
//             if (Files.exists(filePath)) {
//                 Files.delete(filePath);
//             }
//         } catch (IOException e) {
//             throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
//         }
//     }

//     /**
//      * List all files in storage
//      */
//     public List<String> listFiles() {
//         try {
//             Path basePath = Paths.get(storagePath);

//             if (!Files.exists(basePath)) {
//                 return List.of();
//             }

//             return Files.walk(basePath)
//                     .filter(Files::isRegularFile)
//                     .map(p -> basePath.relativize(p).toString())
//                     .collect(Collectors.toList());

//         } catch (IOException e) {
//             throw new RuntimeException("Failed to list files: " + e.getMessage(), e);
//         }
//     }
// }

package com.example.document.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${app.s3.endpoint}")
    private String endpoint;

    @Value("${app.s3.public-endpoint:${app.s3.endpoint}}")
    private String publicEndpoint;

    @Value("${app.s3.region}")
    private String region;

    @Value("${app.s3.access-key}")
    private String accessKey;

    @Value("${app.s3.secret-key}")
    private String secretKey;

    @Value("${app.s3.bucket}")
    private String bucketName;

    @Value("${app.s3.path-style-access}")
    private boolean pathStyleAccess;

    @Value("${app.file.storage-path:/data/documents}")
    private String storagePath;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    // ── Bucket bootstrap ──────────────────────────────────────────────────────

    public void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        }
    }

    // ── Regular upload (bytes through Spring Boot → MinIO) ────────────────────

    public String uploadFile(String key, byte[] content) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build(),
                RequestBody.fromBytes(content)
        );
        return key;
    }

    // ── Download (bytes through Spring Boot ← MinIO) ─────────────────────────

    public byte[] downloadFile(String key) {
        return s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build()
        ).asByteArray();
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void deleteFile(String key) {
        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build()
        );
    }

    // ── Pre-signed PUT URL (browser → MinIO directly) ────────────────────────

    public String generateUploadUrl(String key, String contentType, Duration expiry) {
        try (S3Presigner presigner = buildPresigner()) {
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .putObjectRequest(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(contentType)
                            .build())
                    .build();
            return presigner.presignPutObject(presignRequest).url().toString();
        }
    }

    // ── Pre-signed GET URL (browser ← MinIO directly) ────────────────────────

    public String generateDownloadUrl(String key, Duration expiry) {
        try (S3Presigner presigner = buildPresigner()) {
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build())
                    .build();
            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }

    // ── List all keys ─────────────────────────────────────────────────────────

    public List<String> listFiles() {
        return s3Client.listObjectsV2(
                ListObjectsV2Request.builder()
                        .bucket(bucketName)
                        .build()
        ).contents().stream()
                .map(S3Object::key)
                .collect(Collectors.toList());
    }

    // ── Internal: build a fresh presigner pointing at MinIO ──────────────────

    private S3Presigner buildPresigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .endpointOverride(URI.create(publicEndpoint))
                .serviceConfiguration(software.amazon.awssdk.services.s3.S3Configuration.builder()
                        .pathStyleAccessEnabled(pathStyleAccess)
                        .build())
                .build();
    }
}