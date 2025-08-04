package org.example.planlist.apiPayload.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.planlist.apiPayload.code.BaseCode;
import org.example.planlist.apiPayload.code.SuccessStatus;

@Getter
@AllArgsConstructor
@JsonPropertyOrder({"isSuccess", "code", "message", "result"}) // JSON 응답 순서 지정

public class ApiResponse<T> {
    @JsonProperty("isSuccess") // JSON key를 camelCase로 고정
    private final Boolean isSuccess; // 요청 처리 성공 여부
    private final String code; // 응답 코드 (e.g., COMMON200, TEMP4001)
    private final String message; // 응답 메시지

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T result; // 결과 데이터 (nullable)

    // 성공 응답 생성
    public static <T> ApiResponse<T> onSuccess(T result){
        return new ApiResponse<>(true, SuccessStatus._OK.getCode(), SuccessStatus._OK.getMessage(), result);
    }

    // 성공 응답 생성 (성공 코드 직접 지정)
    public static <T> ApiResponse<T> of(BaseCode code, T result){
        return new ApiResponse<>(true, code.getReasonHttpStatus().getCode(), code.getReasonHttpStatus().getMessage(), result);
    }

    // 실패 응답 생성
    public static <T> ApiResponse<T> onFailure(String code, String message, T data){
        return new ApiResponse<>(false, code, message, data);
    }

}