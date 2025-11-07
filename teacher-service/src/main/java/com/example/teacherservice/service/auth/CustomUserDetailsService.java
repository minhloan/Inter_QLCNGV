package com.example.teacherservice.service.auth;

import com.example.teacherservice.dto.auth.AuthUserDto;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        AuthUserDto dto = modelMapper.map(user, AuthUserDto.class);
        if (user.getPrimaryRole() != null) {
            dto.setRole(user.getPrimaryRole());
            dto.getRoles().add(user.getPrimaryRole());
        }
        
        return new CustomUserDetails(dto);
    }
}

