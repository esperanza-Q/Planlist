//package org.example.planlist.converter;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import jakarta.persistence.AttributeConverter;
//import jakarta.persistence.Converter;
//
//import java.io.IOException;
//import java.util.List;
//
//@Converter
//public class StringListConverter implements AttributeConverter<List<String>, String> {
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    @Override
//    public String convertToDatabaseColumn(List<String> attribute) {
//        try {
//            return objectMapper.writeValueAsString(attribute);
//        } catch (JsonProcessingException e) {
//            throw new IllegalArgumentException("List<String> → JSON 변환 실패");
//        }
//    }
//
//    @Override
//    public List<String> convertToEntityAttribute(String dbData) {
//        try {
//            return objectMapper.readValue(dbData, new TypeReference<>() {});
//        } catch (IOException e) {
//            throw new IllegalArgumentException("JSON → List<String> 변환 실패");
//        }
//    }
//}