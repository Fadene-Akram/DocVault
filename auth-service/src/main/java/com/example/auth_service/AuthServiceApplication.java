package com.example.auth_service;

import com.example.auth_service.service.UserService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	// Seed default users on startup
	@Bean
	ApplicationRunner seedUsers(UserService userService) {
		return args -> {
			try {
				userService.register("admin@dms.com", "admin123",
						List.of("ROLE_ADMIN", "ROLE_USER"));
				userService.register("user@dms.com", "user123",
						List.of("ROLE_USER"));
				System.out.println("Default users created");
			} catch (Exception e) {
				System.out.println("Users already exist, skipping seed");
			}
		};
	}
}