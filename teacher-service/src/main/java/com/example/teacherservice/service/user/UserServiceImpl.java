package com.example.teacherservice.service.user;

import com.example.teacherservice.dto.user.ImportError;
import com.example.teacherservice.dto.user.ImportResult;
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
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

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

    @Override
    public void exportUsersToExcel(HttpServletResponse response, String activeStatus) {
        try {
            // Lấy users từ database với filter theo active status
            List<User> users;
            if (activeStatus != null && !activeStatus.trim().isEmpty()) {
                try {
                    Active active = Active.valueOf(activeStatus.toUpperCase());
                    users = userRepository.findAllByActive(active);
                } catch (IllegalArgumentException e) {
                    // Nếu giá trị không hợp lệ, lấy tất cả
                    users = userRepository.findAll();
                }
            } else {
                // Nếu không có filter, lấy tất cả
                users = userRepository.findAll();
            }
            
            // Tạo workbook và sheet
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Users");
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "Username", "Email", "Password", "PrimaryRole", "Roles", 
                "TeacherCode", "Active", "FirstName", "LastName", "PhoneNumber",
                "Gender", "BirthDate", "Country", "Province", "District", "Ward",
                "HouseNumber", "Qualification", "Skills", "AboutMe"
            };
            
            // Tạo style cho header
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Ghi header
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Tạo data rows
            int rowNum = 1;
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            
            for (User user : users) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                // ID
                row.createCell(colNum++).setCellValue(user.getId() != null ? user.getId() : "");
                
                // Username
                row.createCell(colNum++).setCellValue(user.getUsername() != null ? user.getUsername() : "");
                
                // Email
                row.createCell(colNum++).setCellValue(user.getEmail() != null ? user.getEmail() : "");
                
                // Password - không export password thực tế, để trống
                row.createCell(colNum++).setCellValue("");
                
                // PrimaryRole
                row.createCell(colNum++).setCellValue(
                    user.getPrimaryRole() != null ? user.getPrimaryRole().toString() : "");
                
                // Roles - join bằng dấu phẩy
                String rolesStr = "";
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    rolesStr = user.getRoles().stream()
                        .map(Role::toString)
                        .collect(java.util.stream.Collectors.joining(","));
                }
                row.createCell(colNum++).setCellValue(rolesStr);
                
                // TeacherCode
                row.createCell(colNum++).setCellValue(
                    user.getTeacherCode() != null ? user.getTeacherCode() : "");
                
                // Active
                row.createCell(colNum++).setCellValue(
                    user.getActive() != null ? user.getActive().toString() : "");
                
                // UserDetails
                UserDetails details = user.getUserDetails();
                if (details != null) {
                    row.createCell(colNum++).setCellValue(
                        details.getFirstName() != null ? details.getFirstName() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getLastName() != null ? details.getLastName() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getPhoneNumber() != null ? details.getPhoneNumber() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getGender() != null ? details.getGender().toString() : "");
                    
                    // BirthDate
                    if (details.getBirthDate() != null) {
                        row.createCell(colNum++).setCellValue(dateFormat.format(details.getBirthDate()));
                    } else {
                        row.createCell(colNum++).setCellValue("");
                    }
                    
                    row.createCell(colNum++).setCellValue(
                        details.getCountry() != null ? details.getCountry() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getProvince() != null ? details.getProvince() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getDistrict() != null ? details.getDistrict() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getWard() != null ? details.getWard() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getHouse_number() != null ? details.getHouse_number() : "");
                    row.createCell(colNum++).setCellValue(
                        details.getQualification() != null ? details.getQualification() : "");
                    
                    // Skills - join bằng dấu phẩy
                    String skillsStr = "";
                    if (details.getSkills() != null && !details.getSkills().isEmpty()) {
                        skillsStr = String.join(",", details.getSkills());
                    }
                    row.createCell(colNum++).setCellValue(skillsStr);
                    
                    row.createCell(colNum++).setCellValue(
                        details.getAboutMe() != null ? details.getAboutMe() : "");
                } else {
                    // Fill empty cells nếu không có UserDetails
                    for (int i = 0; i < 12; i++) {
                        row.createCell(colNum++).setCellValue("");
                    }
                }
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Set response headers
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            String filename = "users_export";
            if (activeStatus != null && !activeStatus.trim().isEmpty()) {
                filename += "_" + activeStatus.toLowerCase();
            }
            filename += ".xlsx";
            response.setHeader("Content-Disposition", "attachment; filename=" + filename);
            
            // Write to response
            workbook.write(response.getOutputStream());
            workbook.close();
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi export users ra Excel: " + e.getMessage(), e);
        }
    }

    @Override
    public ImportResult importUsersFromExcel(MultipartFile file) {
        ImportResult result = ImportResult.builder().build();
        List<ImportError> errors = new ArrayList<>();
        
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                result.addError(new ImportError(0, "File không được để trống"));
                return result;
            }
            
            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
                result.addError(new ImportError(0, "File phải là định dạng Excel (.xlsx hoặc .xls)"));
                return result;
            }
            
            // Đọc file Excel
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);
            
            if (sheet == null) {
                result.addError(new ImportError(0, "Sheet không tồn tại"));
                workbook.close();
                return result;
            }
            
            // Validate header row
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                result.addError(new ImportError(0, "Header row không tồn tại"));
                workbook.close();
                return result;
            }
            
            // Đọc data rows
            Set<String> emailsInFile = new HashSet<>(); // Kiểm tra duplicate trong file
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    // Parse row data
                    String email = getCellValueAsString(row, 2); // Column C (Email)
                    String username = getCellValueAsString(row, 1); // Column B (Username)
                    
                    // Validate required fields
                    if (email == null || email.trim().isEmpty()) {
                        errors.add(new ImportError(i + 1, "Email là bắt buộc"));
                        continue;
                    }
                    
                    if (username == null || username.trim().isEmpty()) {
                        errors.add(new ImportError(i + 1, "Username là bắt buộc"));
                        continue;
                    }
                    
                    // Kiểm tra duplicate email trong file
                    if (emailsInFile.contains(email.toLowerCase())) {
                        errors.add(new ImportError(i + 1, "Email trùng lặp trong file: " + email));
                        continue;
                    }
                    emailsInFile.add(email.toLowerCase());
                    
                    // Kiểm tra user đã tồn tại chưa
                    Optional<User> existingUserOpt = userRepository.findByEmail(email);
                    
                    User user;
                    if (existingUserOpt.isPresent()) {
                        // UPDATE - Merge strategy (chỉ update các field có giá trị)
                        user = existingUserOpt.get();
                        updateUserFromExcelRow(user, row, dateFormat);
                        result.incrementUpdated();
                    } else {
                        // CREATE - Tạo mới
                        user = createUserFromExcelRow(row, dateFormat);
                        result.incrementCreated();
                    }
                    
                    // Validate unique fields trước khi save
                    try {
                        validateUniqueFieldsForImport(user, existingUserOpt.isPresent());
                    } catch (ValidationException e) {
                        errors.add(new ImportError(i + 1, e.getMessage()));
                        continue;
                    }
                    
                    // Save user (JPA sẽ tự động sync user_roles table)
                    userRepository.save(user);
                    
                } catch (Exception e) {
                    errors.add(new ImportError(i + 1, "Lỗi xử lý dòng: " + e.getMessage()));
                }
            }
            
            workbook.close();
            result.setErrors(errors);
            
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
        
        return result;
    }
    
    /**
     * Tạo User mới từ Excel row
     */
    private User createUserFromExcelRow(Row row, SimpleDateFormat dateFormat) {
        String username = getCellValueAsString(row, 1);
        String email = getCellValueAsString(row, 2);
        String password = getCellValueAsString(row, 3);
        String primaryRoleStr = getCellValueAsString(row, 4);
        String rolesStr = getCellValueAsString(row, 5);
        String teacherCode = getCellValueAsString(row, 6);
        String activeStr = getCellValueAsString(row, 7);
        
        // Parse roles
        Set<Role> roles = parseRoles(rolesStr);
        Role primaryRole = parsePrimaryRole(primaryRoleStr, roles);
        
        // Parse active
        Active active = Active.ACTIVE;
        if (activeStr != null && !activeStr.trim().isEmpty()) {
            try {
                active = Active.valueOf(activeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                active = Active.ACTIVE;
            }
        }
        
        // Tạo UserDetails
        UserDetails userDetails = createUserDetailsFromRow(row, dateFormat);
        
        // Default password nếu để trống
        if (password == null || password.trim().isEmpty()) {
            password = "DefaultPassword123!"; // Password mặc định
        }
        
        User user = User.builder()
            .username(username)
            .email(email)
            .password(passwordEncoder.encode(password))
            .primaryRole(primaryRole)
            .roles(roles)
            .teacherCode(teacherCode)
            .active(active)
            .userDetails(userDetails)
            .build();
        
        return user;
    }
    
    /**
     * Update User từ Excel row (merge strategy - chỉ update các field có giá trị)
     */
    private void updateUserFromExcelRow(User user, Row row, SimpleDateFormat dateFormat) {
        // Update basic fields (chỉ update nếu có giá trị)
        String username = getCellValueAsString(row, 1);
        if (username != null && !username.trim().isEmpty()) {
            user.setUsername(username);
        }
        
        String password = getCellValueAsString(row, 3);
        if (password != null && !password.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        
        // Update roles
        String rolesStr = getCellValueAsString(row, 5);
        if (rolesStr != null && !rolesStr.trim().isEmpty()) {
            Set<Role> newRoles = parseRoles(rolesStr);
            user.setRoles(newRoles); // Replace hoàn toàn
            
            // Update primaryRole
            String primaryRoleStr = getCellValueAsString(row, 4);
            Role primaryRole = parsePrimaryRole(primaryRoleStr, newRoles);
            user.setPrimaryRole(primaryRole);
        }
        
        String teacherCode = getCellValueAsString(row, 6);
        if (teacherCode != null && !teacherCode.trim().isEmpty()) {
            user.setTeacherCode(teacherCode);
        }
        
        String activeStr = getCellValueAsString(row, 7);
        if (activeStr != null && !activeStr.trim().isEmpty()) {
            try {
                user.setActive(Active.valueOf(activeStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Giữ nguyên giá trị hiện tại
            }
        }
        
        // Update UserDetails (merge strategy)
        if (user.getUserDetails() == null) {
            user.setUserDetails(new UserDetails());
        }
        updateUserDetailsFromRow(user.getUserDetails(), row, dateFormat);
    }
    
    /**
     * Parse roles từ string (format: "TEACHER,MANAGE")
     */
    private Set<Role> parseRoles(String rolesStr) {
        Set<Role> roles = new HashSet<>();
        if (rolesStr != null && !rolesStr.trim().isEmpty()) {
            String[] roleArray = rolesStr.split(",");
            for (String roleStr : roleArray) {
                try {
                    Role role = Role.valueOf(roleStr.trim().toUpperCase());
                    roles.add(role);
                } catch (IllegalArgumentException e) {
                    // Bỏ qua role không hợp lệ
                }
            }
        }
        // Default to TEACHER nếu empty
        if (roles.isEmpty()) {
            roles.add(Role.TEACHER);
        }
        return roles;
    }
    
    /**
     * Parse primaryRole từ string hoặc lấy từ roles set
     */
    private Role parsePrimaryRole(String primaryRoleStr, Set<Role> roles) {
        if (primaryRoleStr != null && !primaryRoleStr.trim().isEmpty()) {
            try {
                return Role.valueOf(primaryRoleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Fall through
            }
        }
        // Lấy role đầu tiên từ set, hoặc default TEACHER
        return roles.isEmpty() ? Role.TEACHER : roles.iterator().next();
    }
    
    /**
     * Tạo UserDetails từ Excel row
     */
    private UserDetails createUserDetailsFromRow(Row row, SimpleDateFormat dateFormat) {
        UserDetails details = new UserDetails();
        updateUserDetailsFromRow(details, row, dateFormat);
        return details;
    }
    
    /**
     * Update UserDetails từ Excel row (merge strategy)
     */
    private void updateUserDetailsFromRow(UserDetails details, Row row, SimpleDateFormat dateFormat) {
        // Update chỉ khi cell có giá trị
        String firstName = getCellValueAsString(row, 8);
        if (firstName != null && !firstName.trim().isEmpty()) {
            details.setFirstName(firstName);
        }
        
        String lastName = getCellValueAsString(row, 9);
        if (lastName != null && !lastName.trim().isEmpty()) {
            details.setLastName(lastName);
        }
        
        String phoneNumber = getCellValueAsString(row, 10);
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            details.setPhoneNumber(phoneNumber);
        }
        
        String genderStr = getCellValueAsString(row, 11);
        if (genderStr != null && !genderStr.trim().isEmpty()) {
            try {
                details.setGender(Gender.valueOf(genderStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Giữ nguyên giá trị hiện tại
            }
        }
        
        String birthDateStr = getCellValueAsString(row, 12);
        if (birthDateStr != null && !birthDateStr.trim().isEmpty()) {
            try {
                details.setBirthDate(dateFormat.parse(birthDateStr));
            } catch (ParseException e) {
                // Giữ nguyên giá trị hiện tại
            }
        }
        
        // Address fields
        String country = getCellValueAsString(row, 13);
        if (country != null && !country.trim().isEmpty()) {
            details.setCountry(country);
        }
        
        String province = getCellValueAsString(row, 14);
        if (province != null && !province.trim().isEmpty()) {
            details.setProvince(province);
        }
        
        String district = getCellValueAsString(row, 15);
        if (district != null && !district.trim().isEmpty()) {
            details.setDistrict(district);
        }
        
        String ward = getCellValueAsString(row, 16);
        if (ward != null && !ward.trim().isEmpty()) {
            details.setWard(ward);
        }
        
        String houseNumber = getCellValueAsString(row, 17);
        if (houseNumber != null && !houseNumber.trim().isEmpty()) {
            details.setHouse_number(houseNumber);
        }
        
        String qualification = getCellValueAsString(row, 18);
        if (qualification != null && !qualification.trim().isEmpty()) {
            details.setQualification(qualification);
        }
        
        String skillsStr = getCellValueAsString(row, 19);
        if (skillsStr != null && !skillsStr.trim().isEmpty()) {
            List<String> skills = Arrays.asList(skillsStr.split(","));
            details.setSkills(skills);
        }
        
        String aboutMe = getCellValueAsString(row, 20);
        if (aboutMe != null && !aboutMe.trim().isEmpty()) {
            details.setAboutMe(aboutMe);
        }
    }
    
    /**
     * Lấy giá trị cell dưới dạng String
     */
    private String getCellValueAsString(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    return sdf.format(cell.getDateCellValue());
                } else {
                    // Xử lý số nguyên
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                // Xử lý công thức
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }
    
    /**
     * Validate unique fields khi import (email, username, teacherCode)
     */
    private void validateUniqueFieldsForImport(User user, boolean isUpdate) {
        Map<String, String> errors = new HashMap<>();
        
        // Kiểm tra email unique (trừ khi đang update chính user đó)
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            Optional<User> existingByEmail = userRepository.findByEmail(user.getEmail());
            if (existingByEmail.isPresent() && 
                (!isUpdate || !existingByEmail.get().getId().equals(user.getId()))) {
                errors.put("email", "Email đã tồn tại: " + user.getEmail());
            }
        }
        
        // Kiểm tra username unique (trừ khi đang update chính user đó)
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            Optional<User> existingByUsername = userRepository.findByUsername(user.getUsername());
            if (existingByUsername.isPresent() && 
                (!isUpdate || !existingByUsername.get().getId().equals(user.getId()))) {
                errors.put("username", "Username đã tồn tại: " + user.getUsername());
            }
        }
        
        // Kiểm tra teacherCode unique (nếu có, trừ khi đang update chính user đó)
        if (user.getTeacherCode() != null && !user.getTeacherCode().isBlank()) {
            List<User> existingByTeacherCode = userRepository.findAll().stream()
                .filter(u -> user.getTeacherCode().equals(u.getTeacherCode()))
                .filter(u -> !u.getId().equals(user.getId()))
                .toList();
            if (!existingByTeacherCode.isEmpty()) {
                errors.put("teacherCode", "TeacherCode đã tồn tại: " + user.getTeacherCode());
            }
        }
        
        if (!errors.isEmpty()) {
            throw ValidationException.builder()
                    .validationErrors(errors)
                    .build();
        }
    }
}
