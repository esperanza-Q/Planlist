package org.example.planlist.apiPayload.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class NotProjectParticipantException extends RuntimeException {
    public NotProjectParticipantException() {
        super("프로젝트 참여자가 아닙니다.");
    }
}
