package com.Config;
import com.Services.CustomOAuth2UserService;
import com.Services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;
    @Autowired
    private CustomUserDetailsService customUserDetailsService; // For Form Login (Email/Password)


    // For your demo, using plain-text passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    // Connects your form login service and password checker
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // This line is now correct
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        // Allow access to static resources and public pages
                        .requestMatchers("/", "/login", "/register", "/css/**", "/image/**", "/js/**").permitAll()
                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )
                // Configure Form Login (your existing email/password form)
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .usernameParameter("email") // <-- ADD THIS LINE
                        .defaultSuccessUrl("/", true)
                        .failureUrl("/login?error=true")
                        .permitAll()
                )
                // Configure OAuth2 Login (Google)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login") // Show your custom login page
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService) // Use our custom service to save the user
                        )
                        .defaultSuccessUrl("/", true) // Redirect here after login
                );

        return http.build();
    }
}
