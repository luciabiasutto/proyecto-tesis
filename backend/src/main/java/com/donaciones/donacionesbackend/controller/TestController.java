package com.donaciones.donacionesbackend.controller;

import org.springframework.web.bind.annotation.*;

/**
 * Controlador de pruebas simples.
 * Lo dejé para chequear que el backend responde durante el desarrollo
 */
@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    //Prueba rápida con GET para ver si la API contesta
    @GetMapping
    public String test() {
        return "Backend funcionando correctamente";
    }

    //Prueba que el backend recibe y devuelve datos por POST
    @PostMapping
    public String testPost(@RequestBody String data) {
        return "POST recibido: " + data;
    }
}

