package com.example.teacherservice.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePasswordRequest {
    @NotBlank(message = "Email là bắt buộc") 
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    // FE gửi "newPassword"
    @NotBlank(message = "Mật khẩu mới là bắt buộc") 
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String newPassword;

    // Tuỳ chọn (để BE vẫn hỗ trợ nhánh cũ dùng OTP trực tiếp)
    private String otp;
}

