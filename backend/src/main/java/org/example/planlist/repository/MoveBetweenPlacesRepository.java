package org.example.planlist.repository;

import org.example.planlist.entity.MoveBetweenPlaces;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoveBetweenPlacesRepository extends JpaRepository<MoveBetweenPlaces, Long> {
    List<MoveBetweenPlaces> findByDatePlanner_CalendarId(Long calendarId);
    List<MoveBetweenPlaces> findByProject_ProjectId(Long projectId);
}