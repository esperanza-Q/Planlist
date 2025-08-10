
package org.example.planlist.config;

import org.example.planlist.handler.OAuth2LoginSuccessHandler;
import org.example.planlist.security.JwtTokenFilter;
import org.example.planlist.security.JwtTokenProvider;
import org.example.planlist.service.CustomOAuth2UserService;
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

/*
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, @Lazy UserDetailsService userDetailsService,
                          CustomOAuth2UserService customOAuth2UserService) { // Lazy 적용
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    //JWT 인증 필터 등록
    @Bean
    public JwtTokenFilter jwtTokenFilter() {
        return new JwtTokenFilter(jwtTokenProvider, userDetailsService);
    }

    //로컬+소셜로그인
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/test/**",
                                "/api/users/**",
                                "/api/auth/**",
                                "/api/calculator/**",
                                "/api/board/**",
                                "/auth/google",
                                "/auth/kakao",
                                "/auth/naver",
                                "/login"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                // 기존 form 로그인(로컬 로그인) 설정
                .formLogin(form -> form
                        .loginPage("/login")      // 커스텀 로그인 페이지 URL
                        .permitAll()
                )
                // OAuth2 로그인 설정 (구글 등 소셜 로그인)
                .oauth2Login(oauth2 -> oauth2
                                // loginPage() 미지정 => 스프링이 기본 OAuth2 로그인 흐름만 처리
                                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                                .defaultSuccessUrl("http://localhost:3000", true)
                        // 필요시 커스텀 OAuth2UserService 지정 가능
                        //.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                )
                // JWT 필터는 UsernamePasswordAuthenticationFilter 앞에 둡니다.
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


}*/
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          @Lazy UserDetailsService userDetailsService,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public JwtTokenFilter jwtTokenFilter() {
        return new JwtTokenFilter(jwtTokenProvider, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/test/**",
                                "/api/users/**",
                                "/api/auth/**",
                                "/api/calculator/**",
                                "/api/board/**",
                                "/auth/google",
                                "/auth/kakao",
                                "/auth/naver",
                                "/login",
                                "/calendar/events",  // ✅ 추가
                                "/oauth2/authorization/google" // ✅ 구글 로그인 진입점 허용
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                )
                .addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}