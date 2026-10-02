package com.ispusulasi.backend.searchquery;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchQueryRepository extends JpaRepository<SearchQuery, Integer> {
    List<SearchQuery> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
