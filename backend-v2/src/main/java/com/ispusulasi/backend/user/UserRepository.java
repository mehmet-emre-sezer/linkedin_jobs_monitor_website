package com.ispusulasi.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    long countByEmailVerifiedTrue();

    /** Son N gunde gorulen kullanicilar (aktiflik icin). */
    long countByLastSeenAtAfter(LocalDateTime threshold);

    /** Belirli andan sonra kayit olanlar (bugun kayit icin). */
    long countByCreatedAtAfter(LocalDateTime threshold);
}