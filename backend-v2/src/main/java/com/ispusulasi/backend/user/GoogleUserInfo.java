package com.ispusulasi.backend.user;

/** Google id_token'dan dogrulanmis kullanici bilgisi. */
public record GoogleUserInfo(
        String googleId,
        String email,
        boolean emailVerified,
        String name
) {}
