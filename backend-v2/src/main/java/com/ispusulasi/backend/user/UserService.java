package com.ispusulasi.backend.user;

import com.ispusulasi.backend.common.email.AuthMailService;
import com.ispusulasi.backend.common.error.ConflictException;
import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.common.error.UnauthorizedException;
import com.ispusulasi.backend.common.security.JwtService;
import com.ispusulasi.backend.user.web.LoginRequest;
import com.ispusulasi.backend.user.web.LoginResponse;
import com.ispusulasi.backend.user.web.RegisterRequest;
import com.ispusulasi.backend.user.web.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMailService authMailService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthMailService authMailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authMailService = authMailService;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ConflictException("Bu email zaten kayıtlı: " + request.email());
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastSeenAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        authMailService.sendVerificationEmail(saved.getId(), saved.getEmail());
        return toResponse(saved);
    }

    public void verifyEmail(String token) {
        Integer userId = parsePurpose(token, JwtService.PURPOSE_EMAIL_VERIFICATION);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    public void requestPasswordReset(String email) {
        // Email enumeration onleme: kullanici yoksa bile sessizce basarili don
        userRepository.findByEmail(email).ifPresent(user ->
                authMailService.sendPasswordResetEmail(user.getId(), user.getEmail()));
    }

    public void resetPassword(String token, String newPassword) {
        Integer userId = parsePurpose(token, JwtService.PURPOSE_PASSWORD_RESET);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private Integer parsePurpose(String token, String purpose) {
        try {
            return jwtService.parsePurposeToken(token, purpose);
        } catch (Exception e) {
            throw new IllegalArgumentException("Geçersiz veya süresi dolmuş token");
        }
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Email veya parola hatalı"));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email veya parola hatalı");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

    public UserResponse getById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + id));
        return toResponse(user);
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.isEmailVerified(),
                user.isAdmin(),
                user.getCreatedAt()
        );
    }
}