package com.ispusulasi.backend.user.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, message = "Parola en az 8 karakter olmalı") String password
) {}
