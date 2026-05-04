package com.example.orchestration.controller;

import com.example.orchestration.dto.CommentDTO;
import com.example.orchestration.dto.DocumentDTO;
import com.example.orchestration.dto.DocumentWithCommentsDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
public class OrchestrationController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/document/{id}")
    public DocumentWithCommentsDTO getDocument(@PathVariable Long id) {

        DocumentWithCommentsDTO response = new DocumentWithCommentsDTO();

        // ✅ Correct: deserialize directly
        DocumentDTO document = restTemplate.getForObject(
                "http://localhost:8082/documents/get/" + id,
                DocumentDTO.class
        );
        response.document = document;

        // Availability-first comments
        try {
            ResponseEntity<List<CommentDTO>> commentsResponse =
                    restTemplate.exchange(
                            "http://localhost:8083/comments/list/" + id,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<List<CommentDTO>>() {}
                    );
            response.comments = commentsResponse.getBody();
        } catch (Exception e) {
            response.comments = List.of(); // fallback
        }

        return response;
    }
}