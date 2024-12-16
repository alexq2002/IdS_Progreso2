# Examen práctico 2 de integración de sistemas
## Scripts SQL para Bases de Datos:
### Servicio Web SOAP (Consulta de Disponibilidad)

```SQL
CREATE DATABASE inventario;

USE inventario;

CREATE TABLE habitaciones (
    id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
    numero_habitacion INT,
    tipo_habitacion VARCHAR(50),
    status ENUM('disponible', 'ocupado', 'mantenimiento')
);
```
---
