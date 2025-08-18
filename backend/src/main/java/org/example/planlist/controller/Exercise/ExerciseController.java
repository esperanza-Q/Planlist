package org.example.planlist.controller.Exercise;

import lombok.RequiredArgsConstructor;
import org.example.planlist.entity.Exercise;
import org.example.planlist.repository.ExerciseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    // 서버에서 한 번만 호출할 용도
    @PostMapping("/load")
    public ResponseEntity<String> loadExercises(@RequestHeader("X-ADMIN-TOKEN") String token) {
        // 서버에서 미리 설정한 토큰과 비교
        if (!"your_admin_secret_token".equals(token)) {
            return ResponseEntity.status(403).body("권한 없음");
        }

        List<String> exercises = List.of(
                "벤치 프레스",
                "인클라인 벤치 프레스",
                "디클라인 벤치 프레스",
                "덤벨 플라이",
                "케이블 크로스오버",
                "푸쉬업",
                "딥스",
                "머신 체스트 프레스",
                "랫 풀다운",
                "풀업",
                "바벨 로우",
                "덤벨 로우",
                "시티드 케이블 로우",
                "데드리프트",
                "페이스 풀",
                "슈러그",
                "오버헤드 프레스",
                "덤벨 숄더 프레스",
                "사이드 레터럴 레이즈",
                "프론트 레이즈",
                "리어 델트 플라이",
                "업라이트 로우",
                "케이블 페이스 풀",
                "바벨 컬",
                "덤벨 컬",
                "해머 컬",
                "컨센트레이션 컬",
                "프리처 컬",
                "트라이셉스 푸시다운",
                "트라이셉스 킥백",
                "딥스",
                "스컬 크러셔",
                "오버헤드 트라이셉스 익스텐션",
                "스쿼트",
                "레그 프레스",
                "런지",
                "데드리프트",
                "레그 컬",
                "레그 익스텐션",
                "카프 레이즈",
                "힙 쓰러스트",
                "글루트 브리지",
                "사이드 레그 레이즈",
                "윗몸 일으키기",
                "크런치",
                "플랭크",
                "사이드 플랭크",
                "레그 레이즈",
                "바이시클 크런치",
                "러시안 트위스트",
                "마운틴 클라이머",
                "케이블 크런치",
                "힐 터치",
                "버피",
                "점핑잭",
                "마운틴 클라이머",
                "스텝업",
                "케틀벨 스윙",
                "체스트 투 바 풀업",
                "박스 점프",
                "파워 클린",
                "런닝머신",
                "실내 사이클",
                "일립티컬",
                "로잉머신",
                "스텝퍼",
                "스피닝 바이크",
                "스키머신",
                "달리기",
                "점핑잭",
                "버피",
                "마운틴 클라이머",
                "하이 니즈",
                "스킵핑",
                "사이드 투 사이드 점프",
                "버터플라이 킥",
                "사이클링",
                "수영",
                "등산",
                "줄넘기",
                "인라인 스케이트",
                "빠른 걷기",
                "농구",
                "축구",
                "에어로빅",
                "줌바",
                "스피닝 클래스",
                "킥복싱",
                "크로스핏",
                "탭댄스",
                "힙합 댄스"
        );

        int addedCount = 0;
        for (String name : exercises) {
            boolean exists = exerciseRepository.findByName(name).isPresent();
            if (!exists) {
                Exercise exercise = Exercise.builder()
                        .name(name)
                        .build();
                exerciseRepository.save(exercise);
                addedCount++;
            }
        }

        return ResponseEntity.ok(addedCount + "개의 운동 데이터가 추가되었습니다.");
    }
}