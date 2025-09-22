package com.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Model.Users;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
}
