package com.ve.app.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

class ErrorContinueRedirectFilterTests {
    private final ErrorContinueRedirectFilter filter = new ErrorContinueRedirectFilter();

    @Test
    void redirectsErrorContinueToHomeBeforeAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        request.addParameter("continue", "");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertEquals(302, response.getStatus());
        assertEquals("/", response.getRedirectedUrl());
        assertNull(chain.getRequest());
    }

    @Test
    void respectsApplicationContextPath() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/app/error");
        request.setContextPath("/app");
        request.addParameter("continue", "");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        assertEquals("/app/", response.getRedirectedUrl());
    }

    @Test
    void preservesNormalErrorsAndOtherContinuePages() throws Exception {
        for (String path : new String[]{"/error", "/intake-form"}) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
            if (!path.equals("/error")) {
                request.addParameter("continue", "");
            }
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            filter.doFilter(request, response, chain);
            assertNull(response.getRedirectedUrl());
            assertSame(request, chain.getRequest());
        }
    }
}
