package com.donaciones.donacionesbackend.util;

import java.util.regex.Pattern;

/**
 * valida contraseñas al registrarse o cambiar la clave
 * exijo mínimo de seguridad básico para la defensa de la tesis
 */
public class PasswordValidator {
    
    // La contraseña debe tener:
    // al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$";
    
    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
    
    /** validación rápida con regex; devuelve true/false sin mensaje*/
    public static boolean isValid(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return pattern.matcher(password).matches();
    }
    
    /** vensaje genérico para mostrar en el formulario del frontend*/
    public static String getValidationMessage() {
        return "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número";
    }
    
    /** revisa regla por regla para dar un error más claro al usuario */
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
    
    /** resultado de la validación con mensaje para el usuario */
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

