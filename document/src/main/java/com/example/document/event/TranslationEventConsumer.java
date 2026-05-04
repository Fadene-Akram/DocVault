package com.example.document.event;

import com.example.document.model.Document;
import com.example.document.repository.DocumentRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class TranslationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(TranslationEventConsumer.class);
    private final DocumentRepository documentRepository;

    public TranslationEventConsumer(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @KafkaListener(topics = "dms.documents.translated", groupId = "documents-service")
    public void onTranslated(ConsumerRecord<String, Map<String, Object>> record) {
        Map<String, Object> event = record.value();
        Long documentId = ((Number) event.get("documentId")).longValue();
        log.info("Received translation event for document {}", documentId);

        documentRepository.findById(documentId).ifPresent(doc -> {
            doc.setTranslatedTitle((String) event.get("translatedTitle"));
            doc.setTranslatedDescription((String) event.get("translatedDescription"));
            doc.setTargetLanguage((String) event.get("targetLanguage"));
            doc.setTranslatedAt(LocalDateTime.now());
            documentRepository.save(doc);
            log.info("Saved translation for document {}: '{}' → '{}'",
                    documentId, doc.getTitle(), doc.getTranslatedTitle());
        });
    }
}