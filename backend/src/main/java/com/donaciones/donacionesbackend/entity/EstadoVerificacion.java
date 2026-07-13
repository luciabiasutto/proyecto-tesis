package com.donaciones.donacionesbackend.entity;

/**
 * estados detallados de verificación y seguimiento de una donación en el punto
 * cubre desde el registro inicial hasta la entrega al beneficiario
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