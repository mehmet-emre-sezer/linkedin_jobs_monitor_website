package com.ispusulasi.backend.searchquery.web;

import com.ispusulasi.backend.searchquery.SearchQueryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search-queries")
public class SearchQueryController {

    private final SearchQueryService searchQueryService;

    public SearchQueryController(SearchQueryService searchQueryService) {
        this.searchQueryService = searchQueryService;
    }

    @GetMapping
    public List<SearchQueryResponse> mySearchQueries(Authentication authentication) {
        return searchQueryService.getByUserEmail(authentication.getName());
    }
}
