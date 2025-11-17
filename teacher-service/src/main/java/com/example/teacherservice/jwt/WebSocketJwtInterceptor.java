package com.example.teacherservice.jwt;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String token = null;

            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token == null) {
                throw new RuntimeException("WebSocket authentication required: missing token");
            }

            try {
                Claims claims = jwtUtil.getClaims(token);
                String userId = claims.get("userId", String.class);
                final var auth = getToken(claims, userId);

                accessor.setUser(auth);
            } catch (Exception e) {
                throw new RuntimeException("WebSocket authentication failed: " + e.getMessage());
            }
        }

        return message;
    }

    private static UsernamePasswordAuthenticationToken getToken(Claims claims, String userId) {
        String issuer = claims.getIssuer(); // dùng làm authority tối thiểu

        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("Invalid token: no userId");
        }

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        issuer != null
                                ? Collections.singletonList(new SimpleGrantedAuthority(issuer))
                                : Collections.emptyList()
                );
        return auth;
    }
}