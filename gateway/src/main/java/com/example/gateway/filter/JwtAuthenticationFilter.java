package com.example.gateway.filter;

import com.example.gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.function.Predicate;

@Component
public class JwtAuthenticationFilter implements GatewayFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod() != null ? request.getMethod().name() : "UNKNOWN";

        // Cho phép OPTIONS requests (CORS preflight) - đặc biệt quan trọng cho WebSocket
        if ("OPTIONS".equals(method)) {
            return chain.filter(exchange);
        }

        final List<String> apiEndpoints = List.of(
                "/v1/teacher/auth/login",
                "/v1/teacher/auth/google-login",
                "/v1/teacher/auth/register",
                "/v1/teacher/auth/forgotPassword",
                "/v1/teacher/auth/verifyOtp",
                "/v1/teacher/auth/updatePassword",
                "/v1/teacher/auth/refresh",
                "/v1/teacher/auth/logout",
                "/eureka");

        // Nếu là WebSocket endpoint, luôn cho phép đi qua (kiểm tra TRƯỚC tất cả các kiểm tra khác)
        // Bao gồm cả /ws/info, /ws/websocket, và các SockJS endpoints khác
        if (path != null && path.startsWith("/ws")) {
            return chain.filter(exchange);
        }

        // Kiểm tra xem path có phải là public endpoint không
        // Cho phép exact match hoặc path bắt đầu với endpoint + "/"
        boolean isPublicEndpoint = apiEndpoints.stream()
                .anyMatch(uri -> {
                    if (path.equals(uri)) {
                        return true;
                    }
                    if (path.startsWith(uri + "/")) {
                        return true;
                    }
                    return false;
                });

        // Chỉ yêu cầu authentication cho các endpoint không phải public
        if (!isPublicEndpoint) {
            if (authMissing(request)) {
                return onError(exchange);
            }

            String token = request.getHeaders().getOrEmpty("Authorization").get(0);

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            try {
                jwtUtil.validateToken(token);
            } catch (Exception e) {
                return onError(exchange);
            }
        } else {
            System.out.println("[Gateway Filter] Allowing public endpoint: " + path);
        }

        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    private boolean authMissing(ServerHttpRequest request) {
        return !request.getHeaders().containsKey("Authorization");
    }
}
