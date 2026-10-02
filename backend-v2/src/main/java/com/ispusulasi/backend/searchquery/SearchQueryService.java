package com.ispusulasi.backend.searchquery;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.searchquery.web.SearchQueryResponse;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchQueryService {

    private final SearchQueryRepository searchQueryRepository;
    private final UserRepository userRepository;

    public SearchQueryService(SearchQueryRepository searchQueryRepository, UserRepository userRepository) {
        this.searchQueryRepository = searchQueryRepository;
        this.userRepository = userRepository;
    }

    public List<SearchQueryResponse> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        return searchQueryRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SearchQueryResponse toResponse(SearchQuery q) {
        return new SearchQueryResponse(
                q.getId(),
                q.getQueryText(),
                q.isActive(),
                q.getCreatedAt(),
                q.getUpdatedAt()
        );
    }
}
