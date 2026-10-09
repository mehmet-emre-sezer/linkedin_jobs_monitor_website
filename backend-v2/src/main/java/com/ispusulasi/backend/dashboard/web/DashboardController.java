package com.ispusulasi.backend.dashboard.web;

import com.ispusulasi.backend.dashboard.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary summary(Authentication authentication) {
        return dashboardService.getSummary(authentication.getName());
    }

    /** Sorgu istatistikleri — scraper henuz uretmiyor, bos liste doner. */
    @GetMapping("/query-stats")
    public java.util.List<QueryStatResponse> queryStats(Authentication authentication) {
        return java.util.List.of();
    }
}
