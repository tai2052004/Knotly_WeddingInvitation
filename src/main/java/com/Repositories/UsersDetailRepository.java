package com.Repositories;

import com.Model.UsersDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

    public interface UsersDetailRepository extends JpaRepository<UsersDetail, Long>
    {
        Optional<UsersDetail> findById(Long id);

    }
