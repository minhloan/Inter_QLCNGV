package com.example.teacherservice.service.auth;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Year;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@example.com}")
    private String from;

    @Value("${app.mail.brand:Your Company}")
    private String brand;

    @Value("${app.mail.otp-subject:Password Reset Code}")
    private String otpSubject;

    public boolean sendOtpEmail(String to, String otp, int minutesValid) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // multipart=true để set cả plain & html
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject(otpSubject);

            String html = buildOtpHtml(otp, minutesValid, brand);
            String plain = buildOtpPlainText(otp, minutesValid, brand);

            helper.setText(plain, html);

            mailSender.send(message);
            return true;
        } catch (MailException ex) {
            log.error("Failed to send OTP email to {}: {}", to, ex.getMessage(), ex);
            return false;
        } catch (Exception ex) {
            log.error("Unexpected error sending OTP email to {}: {}", to, ex.getMessage(), ex);
            return false;
        }
    }

    /**
     * Plain text fallback để client mail không hỗ trợ HTML vẫn đọc được.
     */
    public static String buildOtpPlainText(String otp, int minutesValid, String brand) {
        return """
               Forgot your password?
               Use the code below to reset your password.

               OTP: %s
               This code expires in %d minutes.

               If you didn't request this, you can safely ignore this email.

               © %d %s. All rights reserved.
               """.formatted(otp, minutesValid, Year.now().getValue(), brand);
    }

    /**
     * HTML template cho OTP.
     * Lưu ý: đã escape %% cho các thuộc tính style width="100%%".
     */
    public static String buildOtpHtml(String otp, int minutesValid, String brand) {
        return """
               <!doctype html>
               <html lang="en">
               <head>
                 <meta charset="utf-8">
                 <meta name="viewport" content="width=device-width,initial-scale=1">
                 <title>Password Reset Code</title>
               </head>
               <body style="margin:0;background:#f6f9fc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
                 <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
                   <tr>
                     <td align="center">
                       <table role="presentation" width="100%%" style="max-width:520px;background:#ffffff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.06);">
                         <tr>
                           <td style="padding:28px 28px 8px;text-align:center;">
                             <div style="font-size:18px;font-weight:700;color:#ef4444;margin-bottom:4px;">Forgot your password?</div>
                             <div style="font-size:14px;color:#6b7280;">Use the code below to reset your password.</div>
                           </td>
                         </tr>
                         <tr>
                           <td style="padding:8px 28px 0;text-align:center;">
                             <div style="display:inline-block;padding:14px 20px;border-radius:10px;background:#f3f4f6;border:1px solid #e5e7eb;letter-spacing:6px;font-size:24px;font-weight:700;">
                               %s
                             </div>
                             <div style="margin-top:10px;font-size:12px;color:#6b7280;">This code expires in %d minutes.</div>
                           </td>
                         </tr>
                         <tr>
                           <td style="padding:16px 28px 24px;">
                             <p style="font-size:13px;line-height:1.6;margin:16px 0;color:#4b5563;">
                               If you didn't request this, you can safely ignore this email.
                             </p>
                             <hr style="border:none;border-top:1px solid #f1f5f9;margin:16px 0;">
                             <div style="font-size:12px;color:#94a3b8;text-align:center;">
                               © %d %s. All rights reserved.
                             </div>
                           </td>
                         </tr>
                       </table>
                     </td>
                   </tr>
                 </table>
               </body>
               </html>
               """.formatted(otp, minutesValid, Year.now().getValue(), brand);
    }
}

