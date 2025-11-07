package com.example.teacherservice.service.user;

import com.example.teacherservice.dto.UserInformationDto;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.UserDetails;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.user.UserUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    User SaveUser(RegisterRequest registerRequest);
    List<User> getAllUsers();
    User getUserById(String id);
    User getUserByEmail(String email);
    User getUserByUsername(String username);
    User updateUserById(UserUpdateRequest request, MultipartFile file);
    void deleteUserById(String id);
    User findUserById(String id);
    User findUserByUsername(String username);
    User findUserByEmail(String email);
    UserDetails updateUserDetails(UserDetails toUpdate,UserDetails request, MultipartFile file);
    void updatePasswordByEmail(String email, String rawPassword);
    UserInformationDto convertUserToUserInformationDto(User user);
}
