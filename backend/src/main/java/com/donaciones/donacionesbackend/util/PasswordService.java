package com.donaciones.donacionesbackend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * servicio para hashear y verificar contraseñas con BCrypt
 * si en la BD todavía hay claves viejas en texto plano, el login sigue funcionando
 * y las actualiza al hash en el próximo inicio de sesión
 */
@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String encode(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    public boolean matches(String plainPassword, String storedPassword) {
        if (plainPassword == null || storedPassword == null) {
            return false;
        }
        if (isBcryptHash(storedPassword)) {
            return encoder.matches(plainPassword, storedPassword);
        }
        return plainPassword.equals(storedPassword);
    }

    public boolean needsUpgrade(String storedPassword) {
        return storedPassword == null || !isBcryptHash(storedPassword);
    }

    private boolean isBcryptHash(String storedPassword) {
        return storedPassword.startsWith("$2a$")
                || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$");
    }
}
