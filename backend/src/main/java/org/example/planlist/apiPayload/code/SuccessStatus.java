package org.example.planlist.apiPayload.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.planlist.apiPayload.dto.ReasonDTO;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SuccessStatus implements BaseCode {
    _OK(HttpStatus.OK, "COMMON200", "성공입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public ReasonDTO getReason() {
        return ReasonDTO.builder().message(message).code(code).isSuccess
                (true).build();
    }

    @Override
    public ReasonDTO getReasonHttpStatus() {
        return ReasonDTO.builder().message(message).code(code).isSuccess
                (true).httpStatus(httpStatus).build();
    }
}
