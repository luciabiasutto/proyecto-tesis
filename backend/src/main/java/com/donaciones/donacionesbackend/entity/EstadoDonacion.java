package com.donaciones.donacionesbackend.entity;

/**
 * Estados del ciclo de una donación después de ser aceptada en el punto.
 * Lo uso en reportes y filtros del panel administrativo.
 */
public enum EstadoDonacion {
    RECIBIDA,

    CLASIFICADA,

    DISTRIBUIDA,

    ENTREGADA,

    CANCELADA
}