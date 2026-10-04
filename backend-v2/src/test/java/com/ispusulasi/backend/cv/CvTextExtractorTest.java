package com.ispusulasi.backend.cv;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class CvTextExtractorTest {

    private final CvTextExtractor extractor = new CvTextExtractor();

    @Test
    void gercek_pdften_metin_cikarir() throws Exception {
        byte[] pdf = buildPdf("Emre Sezer - Java Backend Developer");

        String text = extractor.extractText(pdf);

        assertTrue(text.contains("Emre Sezer"));
        assertTrue(text.contains("Java Backend Developer"));
    }

    @Test
    void metinsiz_pdf_hata_firlatir() throws Exception {
        byte[] emptyPdf = buildPdf(null); // sadece bos sayfa, yazi yok

        assertThrows(IllegalArgumentException.class, () -> extractor.extractText(emptyPdf));
    }

    /** Test icin PDFBox ile bellekte bir PDF uretir. */
    private byte[] buildPdf(String line) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            if (line != null) {
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                    cs.newLineAtOffset(50, 700);
                    cs.showText(line);
                    cs.endText();
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
