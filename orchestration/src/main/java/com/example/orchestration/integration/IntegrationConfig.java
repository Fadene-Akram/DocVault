package com.example.orchestration.integration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.http.dsl.Http;

@Configuration
public class IntegrationConfig {

    @Bean
    public IntegrationFlow documentFlow() {
        return flow -> flow
                // Call Document Service (D)
                .handle(Http.outboundGateway("http://localhost:8082/documents/get/{id}")
                        .httpMethod(org.springframework.http.HttpMethod.GET)
                        .expectedResponseType(String.class)
                        .uriVariable("id", "payload"))
                // Pass document JSON forward
                .channel("documentChannel");
    }

    @Bean
    public IntegrationFlow commentsFlow() {
        return flow -> flow
                // Call Comments Service (M)
                .handle(Http.outboundGateway("http://localhost:8083/comments/list/{id}")
                        .httpMethod(org.springframework.http.HttpMethod.GET)
                        .expectedResponseType(String.class)
                        .uriVariable("id", "payload"));
    }
}