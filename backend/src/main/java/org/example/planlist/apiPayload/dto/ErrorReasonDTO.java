package org.example.planlist.apiPayload.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@Builder

public class ErrorReasonDTO {
    private final boolean isSuccess;
    private final String code;
    private final String message;
    private HttpStatus httpStatus;
}
