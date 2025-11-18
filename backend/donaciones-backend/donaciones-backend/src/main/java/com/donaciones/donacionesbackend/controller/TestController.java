package com.donaciones.donacionesbackend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping
    public String test() {
        return "Backend funcionando correctamente";
    }

    @PostMapping
    public String testPost(@RequestBody String data) {
        return "POST recibido: " + data;
    }
}

