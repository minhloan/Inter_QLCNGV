package com.example.gateway.config;

import com.example.gateway.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    private final JwtAuthenticationFilter filter;

    public GatewayConfig(JwtAuthenticationFilter filter) {
        this.filter = filter;
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("teacher-service-websocket", r -> r
                        .path("/ws/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://teacher-service"))
                .route("teacher-service", r -> r.path("/v1/teacher/**")
                        .filters(f -> f.filter(filter))
                        .uri("lb://teacher-service"))
                .build();
    }
}