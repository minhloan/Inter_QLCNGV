package com.example.teacherservice.service.user;

import com.example.teacherservice.dto.user.InformationDto;
import com.example.teacherservice.dto.user.UserAdminDto;
import com.example.teacherservice.dto.user.UserInformationDto;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.exception.ValidationException;
import com.example.teacherservice.enums.Active;
import com.example.teacherservice.enums.Gender;
import com.example.teacherservice.enums.Role;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.UserDetails;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.user.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RequiredArgsConstructor
@Service("userService")
public class UserServiceImpl implements UserService {

    @Override
    public Page<User> getAllUsers(Integer pageNo, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        List<User> fullList = userRepository.findAll();
        return getUserPage(pageable, fullList);
    }
    @Override
    public Page<User> searchUsers(String keyword, Integer pageNo, Integer pageSize) {
        return fetchPageFromDB(keyword, pageNo, pageSize);
    }

    protected Page<User> fetchPageFromDB(String keyword, Integer pageNo, Integer pageSize ) {
        List<User> fullList = userRepository.searchByKeyword(keyword);
        Pageable pageable = PageRequest.of(pageNo -1, pageSize);
        return getUserPage(pageable, fullList);
    }

    private Page<User> getUserPage(Pageable pageable, List<User> user) {
        int start = Math.min((int) pageable.getOffset(), user.size());
        int end = Math.min(start + pageable.getPageSize(), user.size());
        List<User> pageList = user.subList(start, end);

        return new PageImpl<>(pageList, pageable, user.size());
    }

    private final FileService fileService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Override
    public User SaveUser(RegisterRequest registerRequest)   {
        if (userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        Set<Role> initialRoles = new HashSet<>();
        initialRoles.add(Role.TEACHER);

        Active activeStatus = Active.ACTIVE; // default
        if (registerRequest.getStatus() != null) {
            try {
                activeStatus = Active.valueOf(registerRequest.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                activeStatus = Active.ACTIVE;
            }
        }

        Gender genderEnum = null;
        if (registerRequest.getGender() != null && !registerRequest.getGender().trim().isEmpty()) {
            try {
                genderEnum = Gender.valueOf(registerRequest.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                genderEnum = null;
            }
        }

        UserDetails userDetails = UserDetails.builder()
                .gender(genderEnum)
                .phoneNumber(registerRequest.getPhoneNumber())
                .build();

        User toSave = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .email(registerRequest.getEmail())
                .primaryRole(Role.TEACHER)
                .roles(initialRoles)     
                .active(activeStatus)
                .userDetails(userDetails)
                .build();
        return userRepository.save(toSave);
    }

    @Override
    public User getUserById(String id) {
        return findUserById(id);
    }

    @Override
    public User getUserByEmail(String email) {
        return findUserByEmail(email);
    }

    @Override
    public User getUserByUsername(String username) {
        return findUserByUsername(username);
    }

    @Override
    public User updateUserById(UserUpdateRequest request, MultipartFile file) {
        User toUpdate = findUserById(request.getId());
        validateUniqueFields(toUpdate, request);
        request.setUserDetails(updateUserDetails(toUpdate.getUserDetails(), request.getUserDetails(), file));
        modelMapper.map(request, toUpdate);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            toUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                toUpdate.setActive(Active.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                // keep existing status if provided value is invalid
            }
        }
        return userRepository.save(toUpdate);
    }

    @Override
    public void deleteUserById(String id) {
        User toDelete = findUserById(id);
        toDelete.setActive(Active.INACTIVE);
        userRepository.save(toDelete);
    }

    @Override
    public User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public UserDetails updateUserDetails(UserDetails toUpdate, UserDetails request, MultipartFile file) {
        toUpdate = (toUpdate == null) ? new UserDetails() : toUpdate;

        if (file != null && !file.isEmpty()) {
            String profilePicture = fileService.uploadImageToFileSystem(file);
            if (profilePicture != null) {
                // nếu muốn xóa ảnh cũ, cần kiểm tra null trước
                // fileService.deleteImageFromFileSystem(toUpdate.getImageUrl());
                toUpdate.setImageUrl(profilePicture);
            }
        }

        modelMapper.map(request, toUpdate);
        return toUpdate;
    }

    private void validateUniqueFields(User currentUser, UserUpdateRequest request) {
        Map<String, String> errors = new HashMap<>();

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equalsIgnoreCase(currentUser.getUsername())
                && userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            errors.put("username", "Tên đăng nhập đã tồn tại");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(currentUser.getEmail())
                && userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            errors.put("email", "Email đã tồn tại");
        }

        if (!errors.isEmpty()) {
            throw ValidationException.builder()
                    .validationErrors(errors)
                    .build();
        }
    }

    @Override
    public void updatePasswordByEmail(String email, String rawPassword) {
        User user = findUserByEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }


    @Override
    public UserInformationDto convertUserToUserInformationDto(User user) {
        UserInformationDto dto = new UserInformationDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        
        UserDetails userDetails = user.getUserDetails();
        if (userDetails != null) {
            dto.setFirstName(userDetails.getFirstName());
            dto.setLastName(userDetails.getLastName());
            dto.setPhoneNumber(userDetails.getPhoneNumber());
            dto.setGender(userDetails.getGender() != null ? userDetails.getGender().toString() : null);
            dto.setAboutMe(userDetails.getAboutMe());
            dto.setBirthDate(String.valueOf(userDetails.getBirthDate()));
            dto.setImageUrl(userDetails.getImageUrl());
            dto.setQualification(userDetails.getQualification());
            dto.setSkills(userDetails.getSkills() != null ? new ArrayList<>(userDetails.getSkills()) : new ArrayList<>());
            dto.setCountry(userDetails.getCountry());
            dto.setProvince(userDetails.getProvince());
            dto.setDistrict(userDetails.getDistrict());
            dto.setWard(userDetails.getWard());
            dto.setHouse_number(userDetails.getHouse_number());
        }
        
        return dto;
    }

    @Override
    public InformationDto convertUserToInformationDto(User user) {
        InformationDto dto = new InformationDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.getActive() != null ? user.getActive().toString() : null);
        
        UserDetails userDetails = user.getUserDetails();
        if (userDetails != null) {
            dto.setPhoneNumber(userDetails.getPhoneNumber());
        }
        
        return dto;
    }

    @Override
    public UserAdminDto convertUserToUserAdminDto(User user) {
        UserAdminDto dto = new UserAdminDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.getActive() != null ? user.getActive().toString() : null);
        dto.setRoleName(user.getPrimaryRole() != null ? user.getPrimaryRole().toString() : null);
        
        UserDetails userDetails = user.getUserDetails();
        if (userDetails != null) {
            dto.setFirstName(userDetails.getFirstName());
            dto.setLastName(userDetails.getLastName());
            dto.setPhoneNumber(userDetails.getPhoneNumber());
            dto.setGender(userDetails.getGender() != null ? userDetails.getGender().toString() : null);
            dto.setAboutMe(userDetails.getAboutMe());
            if (userDetails.getBirthDate() != null) {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                dto.setBirthDate(sdf.format(userDetails.getBirthDate()));
            } else {
                dto.setBirthDate(null);
            }
            dto.setImageUrl(userDetails.getImageUrl());
            dto.setCountry(userDetails.getCountry());
            dto.setProvince(userDetails.getProvince());
            dto.setDistrict(userDetails.getDistrict());
            dto.setWard(userDetails.getWard());
            dto.setHouse_number(userDetails.getHouse_number());
            dto.setQualification(userDetails.getQualification());
            dto.setSkills(userDetails.getSkills());
        }
        
        return dto;
    }
}
