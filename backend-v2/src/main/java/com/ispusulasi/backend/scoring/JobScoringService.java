package com.ispusulasi.backend.scoring;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.ispusulasi.backend.common.llm.LlmClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JobScoringService {

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public JobScoringService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    public ScoreResult score(String candidateProfile, String title, String company, String description) {
        String desc = (description == null || description.isBlank())
                ? "Açıklama mevcut değil." : description;

        String prompt = SCORING_PROMPT.formatted(candidateProfile, title, company, desc);
        String json = llmClient.askForJson(prompt);

        try {
            JsonNode node = objectMapper.readTree(json);
            return new ScoreResult(
                    node.get("score").asInt(),
                    node.path("reason").asText(""),
                    toList(node.get("matches")),
                    toList(node.get("mismatches"))
            );
        } catch (Exception e) {
            throw new IllegalStateException("Skorlama cevabı parse edilemedi: " + json, e);
        }
    }

    private List<String> toList(JsonNode array) {
        List<String> result = new ArrayList<>();
        if (array != null && array.isArray()) {
            array.forEach(item -> result.add(item.asText()));
        }
        return result;
    }

    private static final String SCORING_PROMPT = """
            Bir adayın iş ilanlarını değerlendiriyorsun.

            Aday profili:
            %s

            İş ilanı:
            Başlık: %s
            Şirket: %s
            Açıklama:
            %s

            KESİN KURAL — BAŞKA HİÇBİR FAKTÖRÜ DİKKATE ALMA:
            Aşağıdakilerden biri varsa skor KESİNLİKLE 10 olacak, ilanın diğer özellikleri ne kadar iyi olursa olsun:
            - 3 veya daha fazla yıl deneyim şartı (Required/Qualifications/Must have bölümünde)
            - Senior / Lead / Principal / Manager ünvanı
            - Birincil stack .NET, C#, Java, PHP, Ruby, Swift, Kotlin (Python olmadan)
            - Yalnızca mobil geliştirme (iOS/Android)
            - Yalnızca frontend (Python/backend olmadan)

            DEĞERLENDİRME KURALLARI:
            - "Required", "Qualifications", "Must have" bölümündeki eşleşmelere yüksek ağırlık ver
            - "Nice to have", "Preferred", "Plus" bölümündeki eşleşmelere düşük ağırlık ver
            - Zorunlu bölümde ciddi uyumsuzluk varsa skoru buna göre düşür
            - Konum: Remote, Hybrid ve On-site hepsi kabul edilebilir

            ÖRNEKLER:

            Kötü eşleşme:
            Başlık: Agentic AI Data Scientist
            Sinyal: "At least 3+ years of work experience in Data Science" — Required bölümünde
            Çıktı: {"score": 10, "matches": [], "mismatches": ["Required: 3+ yıl deneyim şartı"], "reason": "Required bölümünde 3+ yıl deneyim şartı var, diskalifiye edildi"}

            Orta eşleşme:
            Başlık: Junior AI Engineer
            Sinyal: Node.js/TypeScript/Next.js birincil stack, LLM API kullanımı var, Python yok, Remote
            Çıktı: {"score": 72, "matches": ["Junior pozisyon", "Remote", "LLM API deneyimi"], "mismatches": ["Required: birincil stack Node.js/TypeScript, Python yok"], "reason": "Junior ve remote pozisyon, LLM deneyimi uyuşuyor ancak birincil stack Node.js/TypeScript"}

            İyi eşleşme:
            Başlık: Jr. Data Scientist
            Sinyal: Python (pandas, numpy, scikit-learn) Required, SQL, 1-2 yıl deneyim, Hybrid İstanbul
            Çıktı: {"score": 88, "matches": ["Required: Python", "Required: SQL", "1-2 yıl deneyim", "Hybrid İstanbul"], "mismatches": [], "reason": "Python ve data science odaklı, 1-2 yıl deneyim şartı uygun, hybrid İstanbul"}

            SADECE geçerli JSON döndür, başka hiçbir şey yazma:
            {"score": <sayı>, "matches": ["<Required veya Nice-to-have bölümünden somut eşleşmeler>"], "mismatches": ["<Required bölümündeki uyumsuzluklar>"], "reason": "<Türkçe: neden bu skoru verdin, tek cümle>"}
            """;
}
