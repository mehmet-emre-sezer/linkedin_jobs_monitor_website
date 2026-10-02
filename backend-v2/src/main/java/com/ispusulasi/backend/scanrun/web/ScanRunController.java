package com.ispusulasi.backend.scanrun.web;

import com.ispusulasi.backend.scanrun.ScanRunService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/scan-runs")
public class ScanRunController {

    private final ScanRunService scanRunService;

    public ScanRunController(ScanRunService scanRunService) {
        this.scanRunService = scanRunService;
    }

    @GetMapping
    public List<ScanRunResponse> myScanRuns(Authentication authentication) {
        return scanRunService.getByUserEmail(authentication.getName());
    }
}
