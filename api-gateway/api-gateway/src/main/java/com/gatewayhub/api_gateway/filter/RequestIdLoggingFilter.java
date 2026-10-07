package com.gatewayhub.api_gateway.filter;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RequestIdLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RequestIdLoggingFilter.class);
    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestId = UUID.randomUUID().toString();
        long start = System.currentTimeMillis();

        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(h -> h.remove(REQUEST_ID_HEADER))
                .header(REQUEST_ID_HEADER, requestId)
                .build();

        // Return the ID to the client too, so they can quote it when reporting a problem
        exchange.getResponse().getHeaders().add(REQUEST_ID_HEADER, requestId);

        String method = request.getMethod().name();
        String path = request.getURI().getPath();
        log.info("[{}] --> {} {}", requestId, method, path);

        return chain.filter(exchange.mutate().request(request).build())
                .doFinally(signal -> {
                    int status = exchange.getResponse().getStatusCode() != null
                            ? exchange.getResponse().getStatusCode().value() : 0;
                    log.info("[{}] <-- {} {} status={} time={}ms",
                            requestId, method, path, status,
                            System.currentTimeMillis() - start);
                });
    }

    @Override
    public int getOrder() {
        return -3; // first, so even rejected requests get an ID and a log line
    }
}