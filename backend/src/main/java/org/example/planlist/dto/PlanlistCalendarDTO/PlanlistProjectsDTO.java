package org.example.planlist.dto.PlanlistCalendarDTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;

@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlanlistProjectsDTO {

    private Long projectId;
    private Long sessionId;
    private PlannerProject.Category category;
    private String title;
    private String start;
    private String end;

}
