package com.example.teacherservice.service.user;

import com.example.teacherservice.dto.user.ImportResult;
import com.example.teacherservice.dto.user.InformationDto;
import com.example.teacherservice.dto.user.UserAdminDto;
import com.example.teacherservice.dto.user.UserInformationDto;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.UserDetails;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.user.UserUpdateRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    User SaveUser(RegisterRequest registerRequest);
    User getUserById(String id);
    User getUserByEmail(String email);
    User getUserByUsername(String username);
    User updateUserById(UserUpdateRequest request, MultipartFile file, MultipartFile coverFile);
    void deleteUserById(String id);
    User findUserById(String id);
    User findUserByUsername(String username);
    User findUserByEmail(String email);
    UserDetails updateUserDetails(UserDetails toUpdate,UserDetails request, MultipartFile file, MultipartFile coverFile);
    void updatePasswordByEmail(String email, String rawPassword);
    Page<User> getAllUsers(Integer pageNo, Integer pageSize);
    Page<User> searchUsers(String keyword, Integer pageNo, Integer pageSize);
    UserInformationDto convertUserToUserInformationDto(User user);
    InformationDto convertUserToInformationDto(User user);
    UserAdminDto convertUserToUserAdminDto(User user);
    List<User> searchUsers(String keyword);
    
    /**
     * Export users ra file Excel với filter theo trạng thái active
     * @param response HttpServletResponse để ghi file Excel
     * @param activeStatus Trạng thái active (ACTIVE, INACTIVE, hoặc null để export tất cả)
     */
    void exportUsersToExcel(HttpServletResponse response, String activeStatus);
    
    /**
     * Import users từ file Excel
     * @param file File Excel chứa dữ liệu users
     * @return ImportResult chứa kết quả import (số lượng created, updated, errors)
     */
    ImportResult importUsersFromExcel(MultipartFile file);
}
