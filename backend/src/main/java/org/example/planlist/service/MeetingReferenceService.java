package org.example.planlist.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingReferenceDTO.MeetingReferenceRequestDTO;
import org.example.planlist.dto.MeetingReferenceDTO.MeetingReferenceResponseDTO;
import org.example.planlist.entity.MeetingReference;
import org.example.planlist.entity.MeetingSession;
import org.example.planlist.mapper.MeetingReferenceMapper;
import org.example.planlist.repository.MeetingReferenceRepository;
import org.example.planlist.repository.MeetingSessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingReferenceService {

    private final MeetingReferenceRepository meetingReferenceRepository;
    private final MeetingSessionRepository meetingSessionRepository;

    // 회의자료 업로드 및 저장
    @Transactional
    public MeetingReferenceResponseDTO uploadReference(MeetingReferenceRequestDTO dto) {
        MeetingSession session = meetingSessionRepository.findById(dto.getPlannerId())
                .orElseThrow(() -> new IllegalArgumentException("해당 회차가 존재하지 않습니다."));

        MeetingReference reference = MeetingReferenceMapper.toEntity(dto, session);
        meetingReferenceRepository.save(reference);

        return MeetingReferenceMapper.toResponseDTO(reference);
    }

    // 특정 세션에 업로드된 모든 자료 조회
    @Transactional
    public List<MeetingReferenceResponseDTO> getReferencesBySession(Long plannerId) {
        return meetingReferenceRepository.findAllByPlannerId(plannerId);
    }

    // 자료 삭제
    @Transactional
    public void deleteReference(Long fileId) {
        meetingReferenceRepository.deleteById(fileId);
    }
}