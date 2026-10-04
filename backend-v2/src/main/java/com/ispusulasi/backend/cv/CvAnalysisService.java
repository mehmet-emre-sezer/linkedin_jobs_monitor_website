package com.ispusulasi.backend.cv;

import com.ispusulasi.backend.common.llm.LlmClient;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

/**
 * CV metnini Gemini ile analiz eder: profil ozeti + yapilandirilmis bilgiler
 * (ad, universite, mezuniyet, beceriler) + LinkedIn arama sorgulari.
 * Eski cv_parser.py parse_cv_text() karsiligi.
 */
@Service
public class CvAnalysisService {

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public CvAnalysisService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    public CvAnalysisResult analyze(String cvText) {
        String prompt = SETUP_PROMPT.formatted(EXAMPLE_QUERY, cvText);
        String json = llmClient.askForJson(prompt);

        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode structured = root.path("structured");
            return new CvAnalysisResult(
                    root.path("candidate_profile").asText(""),
                    cleanString(structured.path("name").asText(null)),
                    cleanString(structured.path("university").asText(null)),
                    cleanInt(structured.path("graduation_year")),
                    toList(structured.path("skills")),
                    toList(root.path("queries"))
            );
        } catch (Exception e) {
            throw new IllegalStateException("CV analizi cevabı parse edilemedi: " + json, e);
        }
    }

    private List<String> toList(JsonNode array) {
        List<String> result = new ArrayList<>();
        if (array != null && array.isArray()) {
            array.forEach(item -> {
                String s = item.asText("").strip();
                if (!s.isEmpty()) result.add(s);
            });
        }
        return result;
    }

    private String cleanString(String value) {
        if (value == null) return null;
        String s = value.strip();
        return s.isEmpty() ? null : s;
    }

    private Integer cleanInt(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) return null;
        try {
            return node.isNumber() ? node.asInt() : Integer.parseInt(node.asText().strip());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static final String EXAMPLE_QUERY =
            "(\"Junior\" OR \"Entry Level\" OR \"Intern\" OR \"Graduate\" OR \"New Grad\")"
            + " AND (\"Data Scientist\" OR \"Machine Learning Engineer\" OR \"AI Engineer\""
            + " OR \"Backend Developer\" OR \"Software Engineer\")"
            + " AND (Python OR SQL OR API)";

    private static final String SETUP_PROMPT = """
            Bir CV metni verilecek. Bu CV'yi analiz ederek dört şey üret:

            1. Aday profili: CV'deki tüm önemli bilgileri (beceriler, deneyim, projeler, eğitim, tercihler) içeren detaylı metin
            2. LinkedIn arama sorguları: Adaya uygun 5 adet LinkedIn boolean arama sorgusu
            3. Yapılandırılmış kişisel bilgiler: ad soyad, üniversite, mezuniyet yılı
            4. Beceri listesi: CV'den çıkarılan teknik beceriler (en az 3, en fazla 20)

            Sorgu kuralları:
            - LinkedIn keyword alanına direkt yapıştırılabilir olmalı
            - AND, OR, NOT ve "tırnak içi exact match" kullanabilirsin
            - Her sorgu farklı bir açıdan arama yapmalı
            - Junior/entry-level pozisyonları hedeflemeli
            - Adayın güçlü alanlarına odaklan

            Örnek sorgu formatı:
            %s

            CV metni:
            %s

            SADECE geçerli JSON döndür, başka hiçbir şey yazma:
            {
              "candidate_profile": "adayın tüm önemli bilgilerini içeren detaylı metin",
              "queries": ["sorgu 1", "sorgu 2", "sorgu 3", "sorgu 4", "sorgu 5"],
              "structured": {
                "name": "Ad Soyad",
                "university": "Üniversite adı",
                "graduation_year": 2025,
                "skills": ["Skill1", "Skill2", "Skill3"]
              }
            }
            """;
}
