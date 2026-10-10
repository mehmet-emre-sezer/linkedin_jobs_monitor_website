package com.ispusulasi.backend.admin.web;

import com.ispusulasi.backend.admin.AdminService;
import com.ispusulasi.backend.common.error.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public AdminOverview overview(Authentication authentication) {
        adminService.requireAdmin(authentication.getName());
        return adminService.getOverview();
    }

    @GetMapping("/funnel")
    public List<FunnelStep> funnel(Authentication authentication) {
        adminService.requireAdmin(authentication.getName());
        return adminService.getFunnel();
    }

    @GetMapping("/users")
    public List<AdminUserItem> users(Authentication authentication) {
        adminService.requireAdmin(authentication.getName());
        return adminService.listUsers();
    }

    @PostMapping("/scan/{userId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> triggerScan(Authentication authentication, @PathVariable Integer userId) {
        adminService.requireAdmin(authentication.getName());
        if (!adminService.userExists(userId)) {
            throw new NotFoundException("Kullanıcı bulunamadı: " + userId);
        }
        adminService.triggerScan(userId);
        return Map.of("userId", userId, "status", "enqueued");
    }
}
