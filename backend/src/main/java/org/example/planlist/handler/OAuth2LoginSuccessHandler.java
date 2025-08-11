package org.example.planlist.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.example.planlist.security.JwtTokenProvider;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseCookie;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
        setAlwaysUseDefaultTargetUrl(true);      
        setDefaultTargetUrl("http://localhost:3000/home");
        //setDefaultTargetUrl("http://localhost:8080/calendar/events");
    }

    @Override
        public void onAuthenticationSuccess(HttpServletRequest request,
                                            HttpServletResponse response,
                                            Authentication authentication) throws IOException, ServletException {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email"); // provider별로 null일 수 있으니 주의
            String token = jwtTokenProvider.createToken(email);

            // HttpOnly 쿠키로 내려주기
            ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                    .httpOnly(true)           
                    .secure(false)             
                    .sameSite("Lax")           // SPA간 이동이면 "None" + secure가 필요할 수 있음
                    .path("/")
                    .maxAge(60 * 60 * 2)       
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());

            setAlwaysUseDefaultTargetUrl(true);
            setDefaultTargetUrl("http://localhost:3000/home");

            
            super.onAuthenticationSuccess(request, response, authentication);
        }

}
