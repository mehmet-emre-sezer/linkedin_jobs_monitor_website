package com.ispusulasi.backend.scanrun;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_runs")
public class ScanRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "jobs_scanned", nullable = false)
    private int jobsScanned;

    @Column(name = "jobs_new", nullable = false)
    private int jobsNew;

    @Column(name = "jobs_sent", nullable = false)
    private int jobsSent;

    public ScanRun() {}

    public Integer getId() { return id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getJobsScanned() { return jobsScanned; }
    public void setJobsScanned(int jobsScanned) { this.jobsScanned = jobsScanned; }
    public int getJobsNew() { return jobsNew; }
    public void setJobsNew(int jobsNew) { this.jobsNew = jobsNew; }
    public int getJobsSent() { return jobsSent; }
    public void setJobsSent(int jobsSent) { this.jobsSent = jobsSent; }
}
