package com.ispusulasi.backend.user.web;

import com.ispusulasi.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return userService.getByEmail(authentication.getName());
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMe(Authentication authentication) {
        userService.deleteAccount(authentication.getName());
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Integer id) {
        return userService.getById(id);
    }
}