package com.ispusulasi.backend.scraper;

/** LinkedIn'den cekilen ham ilan (henuz skorlanmamis, DB'ye yazilmamis). */
public record ScrapedJob(
        String linkedinId,
        String title,
        String company,
        String location,
        String postedAt,
        String applicants,
        String url,
        String description,
        String sourceQuery
) {}
