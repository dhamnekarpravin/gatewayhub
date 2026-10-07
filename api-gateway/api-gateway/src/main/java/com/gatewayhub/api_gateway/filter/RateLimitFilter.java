package com.gatewayhub.api_gateway.filter;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static class Window {
        final long startMillis;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long startMillis) { this.startMillis = startMillis; }
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final long windowMillis;

    public RateLimitFilter(@Value("${ratelimit.max-requests}") int maxRequests,
                           @Value("${ratelimit.window-seconds}") int windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowSeconds * 1000L;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientKey = clientKey(exchange);
        long now = System.currentTimeMillis();

        // Start a fresh window if none exists or the old one expired
        Window window = windows.compute(clientKey, (k, w) ->
                (w == null || now - w.startMillis >= windowMillis) ? new Window(now) : w);

        int count = window.count.incrementAndGet();
        long retryAfter = Math.max(1, (window.startMillis + windowMillis - now) / 1000);

        exchange.getResponse().getHeaders().set("X-RateLimit-Limit", String.valueOf(maxRequests));
        exchange.getResponse().getHeaders().set("X-RateLimit-Remaining",
                String.valueOf(Math.max(0, maxRequests - count)));

        if (count > maxRequests) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            exchange.getResponse().getHeaders().set("Retry-After", String.valueOf(retryAfter));
            String body = "{\"status\":429,\"error\":\"Too Many Requests\","
                    + "\"message\":\"Rate limit exceeded. Try again in " + retryAfter + " seconds\"}";
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(
                    Mono.just(exchange.getResponse().bufferFactory().wrap(bytes)));
        }

        return chain.filter(exchange);
    }

    // Identify the client by IP address
    private String clientKey(ServerWebExchange exchange) {
        InetSocketAddress remote = exchange.getRequest().getRemoteAddress();
        return remote != null && remote.getAddress() != null
                ? remote.getAddress().getHostAddress() : "unknown";
    }

    @Override
    public int getOrder() {
        return -2; // after request ID, before JWT check
    }
}