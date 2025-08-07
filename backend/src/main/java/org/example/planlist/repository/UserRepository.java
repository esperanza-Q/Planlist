package org.example.planlist.repository;

import org.example.planlist.entity.PtSession;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
<<<<<<< HEAD
    // 기본적인 CRUD는 JpaRepository가 다 지원함
    Optional<User> findByEmail(String email);

=======
    @Query("""
    SELECT u FROM User u
    WHERE u IN (
        SELECT CASE
            WHEN f.user1.id = :userId THEN f.user2
            WHEN f.user2.id = :userId THEN f.user1
        END
        FROM Friend f
        WHERE f.user1.id = :userId OR f.user2.id = :userId
    )
    AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
         OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
""")
    List<User> searchFriends(@Param("userId") Long userId, @Param("keyword") String keyword);
>>>>>>> 2574e59 (WIP: 작업 중인 변경사항)
}