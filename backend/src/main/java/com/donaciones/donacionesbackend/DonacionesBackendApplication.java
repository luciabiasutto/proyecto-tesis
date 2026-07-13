package com.donaciones.donacionesbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * punto de entrada del backend de la tesis
 * acá arranca Spring Boot y carga todos los componentes del sistema de donaciones
 */
@SpringBootApplication
public class DonacionesBackendApplication {

	/** lo uso para levantar la aplicación cuando corro el servidor local o en producción */
	public static void main(String[] args) {
		SpringApplication.run(DonacionesBackendApplication.class, args);
	}

}
