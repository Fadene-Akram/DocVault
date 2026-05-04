package com.example.document.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class DocumentEventProducer {

    private static final String TOPIC = "dms.documents.uploaded";

    private final KafkaTemplate<String, DocumentUploadedEvent> kafkaTemplate;

    public DocumentEventProducer(KafkaTemplate<String, DocumentUploadedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishUploadedEvent(DocumentUploadedEvent event) {
        // Key = documentId so all events for same doc go to same partition
        kafkaTemplate.send(TOPIC, event.getDocumentId().toString(), event);
    }
}