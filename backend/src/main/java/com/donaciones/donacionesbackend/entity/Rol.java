package com.donaciones.donacionesbackend.entity;

/**
 * roles posibles en el sistema de donaciones
 * cada tabla de usuario guarda su rol para el login unificado y los permisos
 */
public enum Rol {

    DONANTE,
  
    PUNTO_DONACION,
   
    BENEFICIARIO,

    ADMINISTRADOR,

    ORGANIZACION
}
