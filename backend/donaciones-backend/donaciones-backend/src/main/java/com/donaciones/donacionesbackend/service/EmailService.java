package com.donaciones.donacionesbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;
    
    public boolean enviarEmailRecuperacion(String email, String token, String rol) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Recuperación de Contraseña - Sistema de Donaciones");
            
            String resetUrl = baseUrl + "/recuperar-contrasena?token=" + token;
            
            String cuerpo = "Hola,\n\n" +
                    "Has solicitado recuperar tu contraseña en el Sistema de Donaciones.\n\n" +
                    "Para restablecer tu contraseña, haz clic en el siguiente enlace:\n" +
                    resetUrl + "\n\n" +
                    "Este enlace expirará en 1 hora.\n\n" +
                    "Si no solicitaste este cambio, ignora este correo.\n\n" +
                    "Saludos,\n" +
                    "Equipo del Sistema de Donaciones";
            
            message.setText(cuerpo);
            message.setFrom("noreply@donaciones.com"); // Cambiar por tu email
            
            mailSender.send(message);
            System.out.println("Email de recuperación enviado a: " + email);
            return true;
        } catch (Exception e) {
            System.err.println("Error al enviar email (el token se generó correctamente): " + e.getMessage());
            // No lanzamos excepción, solo registramos el error
            return false;
        }
    }
}

