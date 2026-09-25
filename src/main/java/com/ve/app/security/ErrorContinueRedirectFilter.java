package com.ve.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

public class ErrorContinueRedirectFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		if ("GET".equals(request.getMethod())
				&& (request.getContextPath() + "/error").equals(request.getRequestURI())
				&& request.getParameterMap().containsKey("continue")) {
			response.sendRedirect(request.getContextPath() + "/");
			return;
		}
		filterChain.doFilter(request, response);
	}
}
