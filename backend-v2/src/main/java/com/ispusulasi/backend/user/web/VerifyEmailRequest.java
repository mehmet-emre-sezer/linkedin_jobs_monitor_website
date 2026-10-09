package com.ispusulasi.backend.user.web;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(@NotBlank String token) {}
