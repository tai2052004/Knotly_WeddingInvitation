package com.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/","/landingPage", "/login", "/css/**", "/js/**").permitAll() // cho phép truy cập
                        .anyRequest().authenticated()  // các request khác cần login
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")   // đường dẫn tới trang login tự tạo
                        .defaultSuccessUrl("/", true) // khi login thành công sẽ chuyển tới /home
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/") // sau khi logout thì về trang chủ
                        .permitAll()
                );

        return http.build();
    }}
