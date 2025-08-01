package org.example.planlist.mapper;

import org.example.planlist.dto.NoteDTO.NoteRequestDTO;
import org.example.planlist.dto.NoteDTO.NoteResponseDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;

public class NoteMapper {

    public static Note toEntity(NoteRequestDTO dto, User user, PlannerProject project) {
        return Note.builder()
                .user(user)
                .project(project)
                .title(dto.getTitle())
                .content(dto.getContent())
                .image(dto.getImage())
                .share(dto.getShare())
                .build();
    }

    public static NoteResponseDTO toResponseDTO(Note entity) {
        return NoteResponseDTO.builder()
                .title(entity.getTitle())
                .content(entity.getContent())
                .image(entity.getImage())
                .share(entity.getShare())
                .build();
    }
}
