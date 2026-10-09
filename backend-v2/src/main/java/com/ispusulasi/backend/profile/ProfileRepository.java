package com.ispusulasi.backend.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Optional<Profile> findByUserId(Integer userId);

    Optional<Profile> findByTelegramLinkToken(String telegramLinkToken);

    /** Taranabilir kullanicilar: email dogrulanmis + admin degil + Telegram bagli. */
    @Query("""
            SELECT p.userId FROM Profile p, User u
            WHERE u.id = p.userId
              AND u.emailVerified = true
              AND u.admin = false
              AND p.telegramChatId IS NOT NULL
            ORDER BY p.userId
            """)
    List<Integer> findScannableUserIds();
}