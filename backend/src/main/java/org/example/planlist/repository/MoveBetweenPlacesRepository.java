package org.example.planlist.repository;

import org.example.planlist.entity.MoveBetweenPlaces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MoveBetweenPlacesRepository extends JpaRepository<MoveBetweenPlaces, Long> {
    List<MoveBetweenPlaces> findByDatePlanner_CalendarId(Long calendarId);
    List<MoveBetweenPlaces> findByProject_ProjectId(Long projectId);

    @Query("""
       SELECT t
       FROM MoveBetweenPlaces t
       WHERE t.datePlanner.calendarId IN :calendarIds
    """)
    List<MoveBetweenPlaces> findAllByDatePlannerIds(@Param("calendarIds") List<Long> calendarIds);

}