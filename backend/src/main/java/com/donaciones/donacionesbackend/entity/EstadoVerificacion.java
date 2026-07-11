package com.donaciones.donacionesbackend.entity;

/**
 * Estados detallados de verificación y seguimiento de una donación en el punto.
 * Cubre desde el registro inicial hasta la entrega al beneficiario.
 */
public enum EstadoVerificacion {

    PENDIENTE,

    VERIFICADA,
 
    RECHAZADA,
  
    RECIBIDA,
 
    CLASIFICADA,

    DISTRIBUIDA,

    ENTREGADA
}