package com.donaciones.donacionesbackend.entity;

/**
 * Estado de aprobación de un punto de donación en el mapa.
 * Cuando una organización crea un punto, arranca en PENDIENTE hasta que el admin lo revise.
 */
public enum EstadoPunto {

    PENDIENTE,
 
    ACTIVO,

    RECHAZADO
}

