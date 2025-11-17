//package com.example.teacherservice.service.teachingassignmentserivce;
//
//
//import com.example.teacherservice.request.TeachingAssignmentCreateRequest;
//import com.example.teacherservice.request.TeachingAssignmentStatusUpdateRequest;
//import com.example.teacherservice.response.TeachingAssignmentDetailResponse;
//import com.example.teacherservice.response.TeachingAssignmentListItemResponse;
//import com.example.teacherservice.response.TeachingEligibilityResponse;
//import org.springframework.data.domain.Page;
//
//import java.util.List;
//
//public interface TeachingAssignmentService {
//    //Check eligibility (registration + exam + trial + evidence)
//    TeachingEligibilityResponse checkEligibility(String teacherId, String subjectId);
//    //Create assignment
//    TeachingAssignmentDetailResponse createAssignment(TeachingAssignmentCreateRequest request,
//                                                      String assignedByUserId);
//    //Update status
//    TeachingAssignmentDetailResponse updateStatus(String assignmentId,
//                                                  TeachingAssignmentStatusUpdateRequest request);
//    // List quản lý
//    List<TeachingAssignmentListItemResponse> getAllAssignments();
//    Page<TeachingAssignmentListItemResponse> getAllAssignments(Integer page, Integer size);
//    Page<TeachingAssignmentListItemResponse> searchAssignments(String keyword, Integer page, Integer size);
//}