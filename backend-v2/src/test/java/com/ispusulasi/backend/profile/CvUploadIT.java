package com.ispusulasi.backend.profile;

import com.ispusulasi.backend.profile.web.ProfileResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayOutputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class CvUploadIT {

    @Autowired
    ProfileService profileService;

    @Test
    void cv_yukleme_profili_doldurur() throws Exception {
        byte[] pdf = buildCvPdf(List.of(
                "Mehmet Emre Sezer",
                "Yazilim Muhendisi - Yeni Mezun (2025)",
                "Beceriler: Java, Spring Boot, PostgreSQL, Python, SQL, REST API",
                "Egitim: Istanbul Teknik Universitesi, Bilgisayar Muhendisligi",
                "Deneyim: Backend staj - mikroservis ve REST API gelistirme"));

        ProfileResponse p = profileService.applyCv("kankam@test.com", "emre_cv.pdf", pdf);

        System.out.printf(">>> name=%s | uni=%s | grad=%s%n", p.name(), p.university(), p.graduationYear());
        System.out.println(">>> skills=" + p.skills());

        assertEquals("emre_cv.pdf", p.cvFilename());
        assertFalse(p.skills().isEmpty(), "CV'den beceri cikarilmaliydi");
    }

    private byte[] buildCvPdf(List<String> lines) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.setLeading(16);
                cs.newLineAtOffset(50, 750);
                for (String line : lines) {
                    cs.showText(line);
                    cs.newLine();
                }
                cs.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
