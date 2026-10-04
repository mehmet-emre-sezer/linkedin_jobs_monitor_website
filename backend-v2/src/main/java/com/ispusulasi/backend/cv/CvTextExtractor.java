package com.ispusulasi.backend.cv;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class CvTextExtractor {

    /** PDF (byte dizisi) icinden duz metni cikarir. */
    public String extractText(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            String text = new PDFTextStripper().getText(document).strip();

            if (text.isEmpty()) {
                throw new IllegalArgumentException(
                        "PDF'den metin çıkarılamadı. Taranmış görsel bir PDF olabilir.");
            }
            return text;

        } catch (IOException e) {
            throw new IllegalStateException("PDF okunamadı", e);
        }
    }
}
