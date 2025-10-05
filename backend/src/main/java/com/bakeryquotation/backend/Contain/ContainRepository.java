package com.bakeryquotation.backend.Contain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContainRepository extends JpaRepository<Contain, ContainId> {
}
