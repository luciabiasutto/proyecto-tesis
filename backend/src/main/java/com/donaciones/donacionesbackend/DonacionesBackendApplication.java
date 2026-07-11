package com.donaciones.donacionesbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del backend de la tesis.
 * Acá arranca Spring Boot y carga todos los componentes del sistema de donaciones.
 */
@SpringBootApplication
public class DonacionesBackendApplication {

	/** Lo uso para levantar la aplicación cuando corro el servidor local o en producción. */
	public static void main(String[] args) {
		SpringApplication.run(DonacionesBackendApplication.class, args);
	}

}
