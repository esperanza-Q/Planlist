package org.example.planlist.repository;

import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 기본적인 CRUD는 JpaRepository가 다 지원함

}