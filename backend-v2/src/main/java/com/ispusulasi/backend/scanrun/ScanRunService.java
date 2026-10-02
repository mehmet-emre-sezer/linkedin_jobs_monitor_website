package com.ispusulasi.backend.scanrun;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.scanrun.web.ScanRunResponse;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScanRunService {

    private final ScanRunRepository scanRunRepository;
    private final UserRepository userRepository;

    public ScanRunService(ScanRunRepository scanRunRepository, UserRepository userRepository) {
        this.scanRunRepository = scanRunRepository;
        this.userRepository = userRepository;
    }

    public List<ScanRunResponse> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        return scanRunRepository.findByUserIdOrderByStartedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ScanRunResponse toResponse(ScanRun s) {
        return new ScanRunResponse(
                s.getId(),
                s.getStartedAt(),
                s.getFinishedAt(),
                s.getStatus(),
                s.getJobsScanned(),
                s.getJobsNew(),
                s.getJobsSent()
        );
    }
}
