package com.ispusulasi.backend.common.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ispusulasi.backend.user.GoogleUserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Google id_token'i Google'in public key'leriyle dogrular
 * (eski google_oauth.verify_google_id_token karsiligi).
 */
@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(List.of(clientId))
                .build();
    }

    public GoogleUserInfo verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Geçersiz Google token");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            Object name = payload.get("name");
            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    Boolean.TRUE.equals(payload.getEmailVerified()),
                    name == null ? "" : name.toString().strip());
        } catch (Exception e) {
            throw new IllegalArgumentException("Google doğrulaması başarısız", e);
        }
    }
}
