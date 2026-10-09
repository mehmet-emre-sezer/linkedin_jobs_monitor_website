package com.ispusulasi.backend.user.web;

public record LoginResponse(String token, UserResponse user) {}
