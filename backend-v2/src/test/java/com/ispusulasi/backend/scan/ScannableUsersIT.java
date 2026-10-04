package com.ispusulasi.backend.scan;

import com.ispusulasi.backend.profile.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ScannableUsersIT {

    @Autowired
    ProfileRepository profileRepository;

    @Test
    void taranabilir_kullanici_sorgusu_calisir() {
        List<Integer> ids = profileRepository.findScannableUserIds();
        System.out.println(">>> Taranabilir kullanici id'leri: " + ids);
        assertNotNull(ids);
    }
}
