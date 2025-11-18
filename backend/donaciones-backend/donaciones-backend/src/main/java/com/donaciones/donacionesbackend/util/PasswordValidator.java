package com.donaciones.donacionesbackend.util;

import java.util.regex.Pattern;

public class PasswordValidator {
    
    // La contraseña debe tener:
    // - Al menos 8 caracteres
    // - Al menos una letra mayúscula
    // - Al menos una letra minúscula
    // - Al menos un número
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$";
    
    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
    
    public static boolean isValid(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return pattern.matcher(password).matches();
    }
    
    public static String getValidationMessage() {
        return "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número";
    }
    
    public static ValidationResult validateWithDetails(String password) {
        if (password == null || password.isEmpty()) {
            return new ValidationResult(false, "La contraseña no puede estar vacía");
        }
        
        if (password.length() < 8) {
            return new ValidationResult(false, "La contraseña debe tener al menos 8 caracteres");
        }
        
        if (!password.matches(".*[a-z].*")) {
            return new ValidationResult(false, "La contraseña debe contener al menos una letra minúscula");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            return new ValidationResult(false, "La contraseña debe contener al menos una letra mayúscula");
        }
        
        if (!password.matches(".*\\d.*")) {
            return new ValidationResult(false, "La contraseña debe contener al menos un número");
        }
        
        return new ValidationResult(true, "Contraseña válida");
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
}

