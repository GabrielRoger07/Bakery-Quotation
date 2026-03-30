package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final TokenConfig tokenConfig;
    private final CompanyRepository companyRepository;
    private final SupplierRepository supplierRepository;

    public WebSocketAuthInterceptor(TokenConfig tokenConfig, CompanyRepository companyRepository, SupplierRepository supplierRepository) {
        this.tokenConfig = tokenConfig;
        this.companyRepository = companyRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.replace("Bearer ", "");
                String subject = tokenConfig.validateToken(token);
                String userType = tokenConfig.getUserTypeFromToken(token);

                if (subject != null && userType != null) {
                    UserDetails userDetails;

                    if ("SUPPLIER".equals(userType)) {
                        userDetails = supplierRepository.findById(Long.parseLong(subject))
                                .map(AuthUserDetails::fromSupplier)
                                .orElseThrow(() -> new RuntimeException("Supplier not found"));
                    } else {
                        userDetails = companyRepository.findByCompanyEmail(subject)
                                .map(AuthUserDetails::fromCompany)
                                .orElseThrow(() -> new RuntimeException("Company not found"));
                    }

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(auth);
                }
            }
        }

        return message;
    }
}
