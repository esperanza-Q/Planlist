package org.example.planlist.repository;

import org.example.planlist.dto.MeetingReferenceDTO.MeetingReferenceResponseDTO;
import org.example.planlist.entity.MeetingReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MeetingReferenceRepository extends JpaRepository<MeetingReference, Long> {
    @Query("SELECT m.fileName AS fileName, m.fileURL AS fileURL, m.fileType AS fileType, m.uploadedAt AS uploadedAt " +
            "FROM MeetingReference m WHERE m.planner.id = :plannerId")
    List<MeetingReferenceResponseDTO> findAllByPlannerId(@Param("plannerId") Long plannerId);
}
