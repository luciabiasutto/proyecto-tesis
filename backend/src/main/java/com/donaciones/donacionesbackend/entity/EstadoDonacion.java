package com.donaciones.donacionesbackend.entity;

public enum EstadoDonacion {
    RECIBIDA("Recibida"),
    CLASIFICADA("Clasificada"),
    DISTRIBUIDA("Distribuida"),
    ENTREGADA("Entregada");
    
    private final String descripcion;
    
    EstadoDonacion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
