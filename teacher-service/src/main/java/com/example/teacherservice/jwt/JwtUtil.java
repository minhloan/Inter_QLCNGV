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
    public static final String SECRET = "56928731907473259834758923975834001978431540789351748901579408315709843175089192839123821057984879453897";

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

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
