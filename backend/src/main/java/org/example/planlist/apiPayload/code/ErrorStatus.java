package org.example.planlist.apiPayload.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.planlist.apiPayload.dto.ErrorReasonDTO;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorStatus implements BaseErrorCode {
    _BAD_REQUEST(HttpStatus.BAD_REQUEST,"COMMON400","잘못된 요청입니다."),
    TEMP_EXCEPTION(HttpStatus.BAD_REQUEST, "TEMP4001", "테스트용 예외입니다."),
    USERNAME_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "EXISTSUSER400", "이미 존재하는 사용자입니다."),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "WRONGPW400", "현재 비밀번호가 일치하지 않습니다."),
    PASSWORD_CONFIRM_MISMATCH(HttpStatus.BAD_REQUEST, "WRONGNEWPW400", "새 비밀번호와 확인용 비밀번호가 일치하지 않습니다."),
    CANNOT_DELETE_CREATOR(HttpStatus.BAD_REQUEST, "CANNOT_DELETE_CREATOR", "프로젝트 생성자는 삭제할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public ErrorReasonDTO getReason() {
        return ErrorReasonDTO.builder().message(message).code(code).isSuccess(false).build();
    }

    @Override
    public ErrorReasonDTO getReasonHttpStatus() {
        return ErrorReasonDTO.builder().message(message).code(code).isSuccess(false).httpStatus(httpStatus).build();

    }
}