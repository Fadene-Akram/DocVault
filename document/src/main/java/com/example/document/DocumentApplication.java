package com.example.document;

import com.example.document.service.S3Service;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@EnableCaching
@SpringBootApplication
public class DocumentApplication {

    public static void main(String[] args) {

        SpringApplication.run(DocumentApplication.class, args);
    }

    @Bean
    ApplicationRunner initBucket(S3Service s3Service) {
        return args -> s3Service.ensureBucketExists();
    }
}