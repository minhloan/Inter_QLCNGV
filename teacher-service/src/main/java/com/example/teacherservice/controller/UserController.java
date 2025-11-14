package com.example.teacherservice.controller;

import com.example.teacherservice.dto.auth.AuthUserDto;
import com.example.teacherservice.dto.auth.UpdatePassword;
import com.example.teacherservice.dto.user.InformationDto;
import com.example.teacherservice.dto.user.UserAdminDto;
import com.example.teacherservice.dto.user.UserDto;
import com.example.teacherservice.dto.user.UserInformationDto;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.User;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.user.UserUpdateRequest;
import com.example.teacherservice.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/teacher/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/information")
    ResponseEntity<UserInformationDto> getInformation(HttpServletRequest request){
        String userId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(userService.convertUserToUserInformationDto(userService.getUserById(userId)));
    }

    @GetMapping("/getAllUsers")
    ResponseEntity<Page<InformationDto>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "6") Integer pageSize){
        Page<InformationDto> users = userService.getAllUsers(pageNo, pageSize)
                .map(user -> userService.convertUserToInformationDto(user));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    ResponseEntity<Page<InformationDto>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "6") Integer pageSize){
        Page<InformationDto> users = userService.searchUsers(keyword, pageNo, pageSize)
                .map(user -> userService.convertUserToInformationDto(user));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/save")
    public ResponseEntity<UserDto> save(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(modelMapper.map(userService.SaveUser(request), UserDto.class));
    }

    @GetMapping("/getUserForAdminByUserId/{id}")
    public ResponseEntity<UserAdminDto> getUserForAdminByUserId(@PathVariable String id) {
        return ResponseEntity.ok(userService.convertUserToUserAdminDto(userService.getUserById(id)));
    }

    @GetMapping("/getUserById/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(modelMapper.map(userService.getUserById(id), UserDto.class));
    }

    @GetMapping("/getUserByEmail")
    public ResponseEntity<AuthUserDto> getUserByEmail(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        AuthUserDto dto = modelMapper.map(user, AuthUserDto.class);
        if (user.getPrimaryRole() != null) {
            dto.setRole(user.getPrimaryRole());
            dto.getRoles().add(user.getPrimaryRole());
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/getUserByUsername/{username}")
    public ResponseEntity<AuthUserDto> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(modelMapper.map(userService.getUserByUsername(username), AuthUserDto.class));
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserAdminDto> updateUserById(
            @Valid @RequestPart("request") UserUpdateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(userService.convertUserToUserAdminDto(userService.updateUserById(request, file)));
    }

    @DeleteMapping("/deleteUserById/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-password")
    public ResponseEntity<Void> updatePassword(@RequestBody UpdatePassword request) {
        User user = userService.findUserByEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return ResponseEntity.noContent().build();
    }
}
