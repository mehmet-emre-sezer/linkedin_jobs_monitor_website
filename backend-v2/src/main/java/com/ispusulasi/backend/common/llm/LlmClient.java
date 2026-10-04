package com.ispusulasi.backend.common.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Saglayici-bagimsiz LLM istemcisi (OpenAI-uyumlu chat endpoint).
 * Su an Gemini'ye baglaniyor; base-url + model + api-key degistirince baska
 * saglayiciya gecilir (Groq, OpenAI vs.) — kod degismez.
 */
@Component
public class LlmClient {

    private final RestClient restClient;
    private final String model;

    public LlmClient(
            @Value("${app.gemini.base-url}") String baseUrl,
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.model}") String model) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
        this.model = model;
    }

    /**
     * Prompt gonderir, modelin ham metin cevabini doner.
     * 503 (asiri yuk) / 429 (rate limit) durumunda otomatik tekrar dener:
     * 3 deneme, artan bekleme (1sn -> 2sn -> 4sn).
     */
    @Retryable(
            includes = {HttpServerErrorException.class, HttpClientErrorException.TooManyRequests.class},
            maxRetries = 3,
            delay = 1000,
            multiplier = 2.0)
    public String ask(String prompt) {
        return callApi(prompt);
    }

    /** Asil HTTP cagrisi. private -> retry'i saran proxy sadece ask/askForJson'u sarar. */
    private String callApi(String prompt) {
        ChatResponse response = restClient.post()
                .uri("/chat/completions")
                .body(new ChatRequest(model, List.of(new Message("user", prompt)), 0.2))
                .retrieve()
                .body(ChatResponse.class);

        if (response == null || response.choices().isEmpty()) {
            throw new IllegalStateException("LLM bos cevap dondu");
        }
        return response.choices().get(0).message().content().strip();
    }

    /**
     * Prompt gonderir, cevaptan sadece JSON govdesini ayiklayip doner.
     * Retry burada da tanimli: askForJson -> ask ayni sinif ici cagri oldugu icin
     * ask'taki proxy devreye girmez; bu yuzden JSON yolu kendi retry'ini tasir.
     */
    @Retryable(
            includes = {HttpServerErrorException.class, HttpClientErrorException.TooManyRequests.class},
            maxRetries = 3,
            delay = 1000,
            multiplier = 2.0)
    public String askForJson(String prompt) {
        return extractJson(callApi(prompt));
    }

    /** Markdown ``` cercevesini atar, ilk { ile son } arasini alir. */
    private String extractJson(String raw) {
        String cleaned = raw;
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```(json)?", "").strip();
        }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start != -1 && end > start) {
            cleaned = cleaned.substring(start, end + 1);
        }
        return cleaned;
    }

    // --- OpenAI-uyumlu istek/yanit govdeleri ---
    private record ChatRequest(String model, List<Message> messages, double temperature) {}
    private record Message(String role, String content) {}
    private record ChatResponse(List<Choice> choices) {}
    private record Choice(Message message) {}
}
