package org.example.planlist.util;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class Interval {
    private LocalTime start;
    private LocalTime end;

    // 교집합 여부 판단
    public boolean overlaps(Interval other) {
        return !(this.end.isBefore(other.start) || this.start.isAfter(other.end));
    }

    // 교집합 구하기 (겹치지 않으면 null 반환)
    public Interval intersect(Interval other) {
        if (!overlaps(other)) return null;
        LocalTime newStart = this.start.isAfter(other.start) ? this.start : other.start;
        LocalTime newEnd = this.end.isBefore(other.end) ? this.end : other.end;
        return new Interval(newStart, newEnd);
    }
}
