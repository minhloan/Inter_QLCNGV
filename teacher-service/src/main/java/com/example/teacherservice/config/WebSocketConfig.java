package com.example.teacherservice.config;

import com.example.teacherservice.jwt.WebSocketJwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtInterceptor webSocketJwtInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint for WebSocket connection
        // CORS is configured here using setAllowedOriginPatterns
        // This is the ONLY place where CORS headers should be added for WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://shopee-fake.id.vn",
                        "http://www.shopee-fake.id.vn"
                )
                .withSockJS(); // Fallback for browsers that don't support WebSocket

        // Also support raw WebSocket without SockJS (for native WebSocket support)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://shopee-fake.id.vn",
                        "http://www.shopee-fake.id.vn"
                );
        // Note: No withSockJS() here - this is for native WebSocket connections
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketJwtInterceptor);
    }
}

