package com.ispusulasi.backend.job;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.job.web.JobResponse;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public List<JobResponse> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        return jobRepository.findByUserIdOrderByScoreDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private JobResponse toResponse(Job j) {
        return new JobResponse(
                j.getId(),
                j.getLinkedinId(),
                j.getTitle(),
                j.getCompany(),
                j.getLocation(),
                j.getPostedAt(),
                j.getApplicants(),
                j.getScore(),
                j.getSummary(),
                j.getMatchedKeywords(),
                j.getUrl(),
                j.getCreatedAt()
        );
    }
}
