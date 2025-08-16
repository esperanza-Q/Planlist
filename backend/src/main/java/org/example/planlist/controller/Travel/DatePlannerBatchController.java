package org.example.planlist.controller.Travel;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerBatchRequestDTO;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerBatchSaveResultDTO;
import org.example.planlist.service.Travel.DatePlannerBatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/travel/{projectId}/dateplanner")
@RequiredArgsConstructor
public class DatePlannerBatchController {

    private final DatePlannerBatchService datePlannerBatchService;

    @PostMapping("/batch")
    public ResponseEntity<DatePlannerBatchSaveResultDTO> saveBatch(
            @PathVariable Long projectId,
            @RequestBody DatePlannerBatchRequestDTO batchRequest) {

        DatePlannerBatchSaveResultDTO result = datePlannerBatchService.saveBatch(projectId, batchRequest);
        return ResponseEntity.ok(result);
    }
}
