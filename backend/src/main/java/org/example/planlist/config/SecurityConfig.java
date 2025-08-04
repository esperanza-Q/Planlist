package org.example.planlist.config;

import org.example.planlist.security.JwtTokenFilter;
import org.example.planlist.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, @Lazy UserDetailsService userDetailsService) { // Lazy 적용
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    //JWT 인증 필터 등록
    @Bean
    public JwtTokenFilter jwtTokenFilter() {
        return new JwtTokenFilter(jwtTokenProvider, userDetailsService);
    }

    //로컬 로그인
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/test/**", "/api/users/**","/api/auth/**", "/api/calculator/**", "/api/board/**").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .addFilterBefore(new JwtTokenFilter(jwtTokenProvider, userDetailsService), UsernamePasswordAuthenticationFilter.class);  // UserDetailsService 사용
//
//        return http.build();
//    }

    //소셜 로그인
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeRequests(authorizeRequests ->
//                        authorizeRequests
//                                .requestMatchers("/auth/google", "/auth/kakao", "/auth/naver").permitAll() // 소셜 로그인 엔드포인트는 인증 없이 접근 가능
//                                .anyRequest().authenticated() // 그 외의 요청은 인증이 필요
//                )
//                .formLogin(formLogin ->
//                        formLogin
//                                .loginPage("/login") // 커스텀 로그인 페이지 설정
//                                .permitAll() // 로그인 페이지는 누구나 접근 가능
//                )
//                .csrf(csrf -> csrf.disable()); // 개발 시 CSRF 보호를 비활성화
//        return http.build();
//    }

    //소셜+로컬 로그인
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 로컬 로그인 및 회원가입 API, 테스트 API 공개
                        .requestMatchers("/test/**", "/api/users/**", "/api/auth/**", "/api/calculator/**", "/api/board/**").permitAll()

                        // 소셜 로그인 엔드포인트 공개
                        .requestMatchers("/auth/google", "/auth/kakao", "/auth/naver").permitAll()

                        // 커스텀 로그인 페이지 공개
                        .requestMatchers("/login").permitAll()

                        // 나머지 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                // formLogin 설정: 커스텀 로그인 페이지 사용
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                )
                // JWT 토큰 필터를 UsernamePasswordAuthenticationFilter 전에 추가
                .addFilterBefore(new JwtTokenFilter(jwtTokenProvider, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //인증 매니저
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }


}