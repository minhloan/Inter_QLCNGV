package com.example.teacherservice.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {
    public static final String SECRET = "WJi385Pfze28ESXzw0L1JjqZOj4HbZj3u0qr4MbS48Q";

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Hàm dùng để lấy userId từ header Authorization
    public String ExtractUserId(HttpServletRequest request) {
        String auHeader = request.getHeader("Authorization");
        if (auHeader != null && auHeader.startsWith("Bearer ")) {
            String token = auHeader.substring(7);
            Claims claims = getClaims(token);
            return claims.get("userId",String.class);
        } else {
            throw new RuntimeException("Authorization header is missing or invalid");
        }
    }
}
