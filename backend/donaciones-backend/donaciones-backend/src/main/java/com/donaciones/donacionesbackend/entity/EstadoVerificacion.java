package com.donaciones.donacionesbackend.entity;

public enum EstadoVerificacion {
    PENDIENTE,      // Donación registrada, esperando verificación
    VERIFICADA,     // Donación verificada por el punto
    RECHAZADA,      // Donación rechazada por el punto
    RECIBIDA,       // Donación recibida físicamente
    CLASIFICADA,    // Donación clasificada
    DISTRIBUIDA,    // Donación distribuida
    ENTREGADA       // Donación entregada al beneficiario
}