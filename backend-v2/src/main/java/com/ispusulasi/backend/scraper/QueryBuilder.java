package com.ispusulasi.backend.scraper;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Kullanici tercihlerinden duz LinkedIn keyword sorgulari uretir.
 * ONEMLI: LinkedIn guest aramasi boolean/tirnak DESTEKLEMEZ -> duz "{seviye} {rol}".
 * Ornek: roles=["ML Engineer"], levels=["Junior","Intern"]
 *        -> ["Junior ML Engineer", "Intern ML Engineer"]
 */
@Component
public class QueryBuilder {

    public List<String> buildQueries(List<String> roles, List<String> levels) {
        List<String> cleanRoles = clean(roles);
        if (cleanRoles.isEmpty()) {
            return List.of();
        }
        List<String> cleanLevels = clean(levels);

        List<String> queries = new ArrayList<>();
        for (String role : cleanRoles) {
            if (cleanLevels.isEmpty()) {
                queries.add(role);
            } else {
                for (String level : cleanLevels) {
                    queries.add(level + " " + role);
                }
            }
        }
        return queries;
    }

    private List<String> clean(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream().map(String::strip).filter(s -> !s.isEmpty()).toList();
    }
}
