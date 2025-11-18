package com.example.teacherservice.service.teachingassignmentserivce;


import com.example.teacherservice.enums.AssignmentStatus;
import com.example.teacherservice.request.TeachingAssignmentCreateRequest;
import com.example.teacherservice.request.TeachingAssignmentStatusUpdateRequest;
import com.example.teacherservice.response.TeachingAssignmentDetailResponse;
import com.example.teacherservice.response.TeachingAssignmentListItemResponse;
import com.example.teacherservice.response.TeachingEligibilityResponse;
import org.springframework.data.domain.Page;


public interface TeachingAssignmentService {
    //Check eligibility (registration + exam + trial + evidence)
    TeachingEligibilityResponse checkEligibility(String teacherId, String subjectId);
    //Create assignment
    TeachingAssignmentDetailResponse createAssignment(TeachingAssignmentCreateRequest request, String assignedByUserId);
    //Update status
    TeachingAssignmentDetailResponse updateStatus(String assignmentId, TeachingAssignmentStatusUpdateRequest request);
    // List quản lý
    Page<TeachingAssignmentListItemResponse> getAllAssignments(Integer page, Integer size);
    Page<TeachingAssignmentListItemResponse> searchAssignments(String keyword, AssignmentStatus status, String semester, Integer page, Integer size);
    TeachingAssignmentDetailResponse getById(String id);

    // List phân công cho chính giáo viên (self)
    Page<TeachingAssignmentListItemResponse> searchAssignmentsForTeacher(
            String teacherId,
            String keyword,
            AssignmentStatus status,
            Integer year,
            Integer page,
            Integer size
    );
}