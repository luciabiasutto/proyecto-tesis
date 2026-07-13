package com.donaciones.donacionesbackend.entity;

/**
 * estados del ciclo de una donación después de ser aceptada en el punto
 * lo uso en reportes y filtros del panel administrativo
 */
public enum EstadoDonacion {
    RECIBIDA,

    CLASIFICADA,

    DISTRIBUIDA,

    ENTREGADA,

    CANCELADA
}