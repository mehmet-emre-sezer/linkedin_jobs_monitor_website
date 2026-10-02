package com.ispusulasi.backend.searchquery.web;

import java.time.LocalDateTime;

public record SearchQueryResponse(
        Integer id,
        String queryText,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
