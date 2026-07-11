package com.donaciones.donacionesbackend.entity;

/**
 * Roles posibles en el sistema de donaciones.
 * Cada tabla de usuario guarda su rol para el login unificado y los permisos.
 */
public enum Rol {

    DONANTE,
  
    PUNTO_DONACION,
   
    BENEFICIARIO,

    ADMINISTRADOR,

    ORGANIZACION
}
