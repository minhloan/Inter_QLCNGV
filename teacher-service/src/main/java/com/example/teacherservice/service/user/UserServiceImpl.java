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

import java.text.SimpleDateFormat;
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
    public List<User> searchUsers(String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchByKeyword(keyword.trim());
        }
        return userRepository.findAll();
    }

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
    public User updateUserById(UserUpdateRequest request, MultipartFile file, MultipartFile coverFile) {
        try {
            if (request == null || request.getId() == null || request.getId().isBlank()) {
                throw new IllegalArgumentException("User ID is required");
            }
            
            User toUpdate = findUserById(request.getId());
            validateUniqueFields(toUpdate, request);
            
            // Update userDetails first (handles file upload and mapping)
            UserDetails updatedUserDetails = updateUserDetails(toUpdate.getUserDetails(), request.getUserDetails(), file, coverFile);
            toUpdate.setUserDetails(updatedUserDetails);
            
            // Map other fields from request to user (excluding userDetails to avoid overwriting)
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                toUpdate.setEmail(request.getEmail());
            }
            if (request.getUsername() != null && !request.getUsername().isBlank()) {
                toUpdate.setUsername(request.getUsername());
            }

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                toUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                try {
                    toUpdate.setActive(Active.valueOf(request.getStatus().toUpperCase()));
                } catch (IllegalArgumentException ex) {
                    // keep existing status if provided value is invalid
                    System.out.println("Invalid status value: " + request.getStatus());
                }
            }
            return userRepository.save(toUpdate);
        } catch (Exception e) {
            System.out.println("Error in updateUserById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
    public UserDetails updateUserDetails(UserDetails toUpdate, UserDetails request, MultipartFile file, MultipartFile coverFile) {
        toUpdate = (toUpdate == null) ? new UserDetails() : toUpdate;

        // Handle profile picture upload (file)
        if (file != null && !file.isEmpty()) {
            try {
                System.out.println("Uploading profile picture: " + file.getOriginalFilename() + ", size: " + file.getSize() + ", type: " + file.getContentType());
                String profilePicture = fileService.uploadImageToFileSystem(file);
                System.out.println("Profile picture uploaded successfully, ID: " + profilePicture);
                
                if (profilePicture != null) {
                    // Delete old profile picture if exists
                    if (toUpdate.getImageUrl() != null && !toUpdate.getImageUrl().isBlank()) {
                        try {
                            fileService.deleteImageFromFileSystem(toUpdate.getImageUrl());
                            System.out.println("Deleted old profile picture: " + toUpdate.getImageUrl());
                        } catch (Exception e) {
                            // Log error but don't fail the update
                            System.out.println("Error deleting old profile picture: " + e.getMessage());
                        }
                    }
                    toUpdate.setImageUrl(profilePicture);
                }
            } catch (Exception e) {
                System.out.println("Error uploading profile picture: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Error uploading profile picture: " + e.getMessage(), e);
            }
        }

        // Handle cover image upload (coverFile)
        if (coverFile != null && !coverFile.isEmpty()) {
            try {
                System.out.println("Uploading cover image: " + coverFile.getOriginalFilename() + ", size: " + coverFile.getSize() + ", type: " + coverFile.getContentType());
                String coverImage = fileService.uploadImageToFileSystem(coverFile);
                System.out.println("Cover image uploaded successfully, ID: " + coverImage);
                
                if (coverImage != null) {
                    // Delete old cover image if exists
                    if (toUpdate.getImageCoverUrl() != null && !toUpdate.getImageCoverUrl().isBlank()) {
                        try {
                            fileService.deleteImageFromFileSystem(toUpdate.getImageCoverUrl());
                            System.out.println("Deleted old cover image: " + toUpdate.getImageCoverUrl());
                        } catch (Exception e) {
                            // Log error but don't fail the update
                            System.out.println("Error deleting old cover image: " + e.getMessage());
                        }
                    }
                    toUpdate.setImageCoverUrl(coverImage);
                }
            } catch (Exception e) {
                System.out.println("Error uploading cover image: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Error uploading cover image: " + e.getMessage(), e);
            }
        }

        // Only map if request is not null
        if (request != null) {
            try {
                // Map fields manually to avoid issues with nested objects
                if (request.getFirstName() != null) {
                    toUpdate.setFirstName(request.getFirstName());
                }
                if (request.getLastName() != null) {
                    toUpdate.setLastName(request.getLastName());
                }
                if (request.getPhoneNumber() != null) {
                    toUpdate.setPhoneNumber(request.getPhoneNumber());
                }
                if (request.getGender() != null) {
                    toUpdate.setGender(request.getGender());
                }
                if (request.getAboutMe() != null) {
                    toUpdate.setAboutMe(request.getAboutMe());
                }
                if (request.getBirthDate() != null) {
                    toUpdate.setBirthDate(request.getBirthDate());
                }
                if (request.getCountry() != null) {
                    toUpdate.setCountry(request.getCountry());
                }
                if (request.getProvince() != null) {
                    toUpdate.setProvince(request.getProvince());
                }
                if (request.getDistrict() != null) {
                    toUpdate.setDistrict(request.getDistrict());
                }
                if (request.getWard() != null) {
                    toUpdate.setWard(request.getWard());
                }
                if (request.getHouse_number() != null) {
                    toUpdate.setHouse_number(request.getHouse_number());
                }
                if (request.getQualification() != null) {
                    toUpdate.setQualification(request.getQualification());
                }
                if (request.getSkills() != null) {
                    toUpdate.setSkills(request.getSkills());
                }
            } catch (Exception e) {
                System.out.println("Error mapping UserDetails: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Error updating user details: " + e.getMessage(), e);
            }
        }
        return toUpdate;
    }

    private void validateUniqueFields(User currentUser, UserUpdateRequest request) {
        Map<String, String> errors = new HashMap<>();

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
            dto.setImageCoverUrl(userDetails.getImageCoverUrl());
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
        dto.setRole(user.getPrimaryRole() != null ? user.getPrimaryRole().toString() : null);
        dto.setTeacherCode(user.getTeacherCode());
        
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
                SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                dto.setBirthDate(sdf.format(userDetails.getBirthDate()));
            } else {
                dto.setBirthDate(null);
            }
            dto.setImageUrl(userDetails.getImageUrl());
            dto.setImageCoverUrl(userDetails.getImageCoverUrl());
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
