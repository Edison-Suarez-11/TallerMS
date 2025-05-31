# TallerMS
2.

Método: GET

URL ejemplo: http://localhost:8000/api/vehiculos

Descripción: Lista todos los vehículos.

3.

Método: POST

URL ejemplo: http://localhost:8000/api/vehiculos

JSON requerido:

json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020,
  "disponible": true
}

4.

Método: GET

URL ejemplo: http://localhost:8000/api/vehiculos/1

Descripción: Obtiene el detalle de un vehículo por ID.

5.

Método: PUT

URL ejemplo: http://localhost:8000/api/vehiculos/1

JSON requerido:

json

{
  "marca": "Mazda",
  "modelo": "3",
  "anio": 2022,
  "disponible": false
}

6.

Método: DELETE

URL ejemplo: http://localhost:8000/api/vehiculos/1

Descripción: Elimina un vehículo.

7.

Método: GET

URL ejemplo: http://localhost:8000/api/vehiculos-disponibles

Descripción: Lista todos los vehículos que están disponibles.

8.

Método: GET

URL ejemplo:
http://localhost:8000/api/vehiculos/disponibles-en-rango?inicio=2025-06-01&fin=2025-06-10

Descripción: Muestra vehículos disponibles en un rango de fechas.

9.

Método: GET

URL ejemplo: http://localhost:8000/api/vehiculos/1/historial

Descripción: Muestra el historial de reservas de un vehículo.

Clientes
10.

Método: GET

URL ejemplo: http://localhost:8000/api/clientes

Descripción: Lista todos los clientes.

11.

Método: POST

URL ejemplo: http://localhost:8000/api/clientes

JSON requerido:

json

{
  "nombre": "Edison",
  "email": "edison@example.com",
  "telefono": "123456789"
}

12.

Método: GET

URL ejemplo: http://localhost:8000/api/clientes/1

Descripción: Muestra los detalles de un cliente.

13.

Método: PUT

URL ejemplo: http://localhost:8000/api/clientes/1

JSON requerido:

json

{
  "nombre": "Edison Torres",
  "email": "et@example.com",
  "telefono": "987654321"
}

14.

Método: DELETE

URL ejemplo: http://localhost:8000/api/clientes/1

Descripción: Elimina un cliente.

15.

Método: GET

URL ejemplo: http://localhost:8000/api/clientes/1/historial

Descripción: Muestra el historial de reservas de un cliente.

 Reservas
16.

Método: GET

URL ejemplo: http://localhost:8000/api/reservas

Descripción: Lista todas las reservas.

17.

Método: POST

URL ejemplo: http://localhost:8000/api/reservas

JSON requerido:

json
{
  "cliente_id": 1,
  "vehiculo_id": 2,
  "fecha_inicio": "2025-06-01",
  "fecha_fin": "2025-06-10"
}
Descripción: Crea una nueva reserva.

18.

Método: GET

URL ejemplo: http://localhost:8000/api/reservas/1

Descripción: Muestra detalles de una reserva específica.

19.

Método: PUT

URL ejemplo: http://localhost:8000/api/reservas/1

JSON requerido:

json

{
  "fecha_inicio": "2025-06-02",
  "fecha_fin": "2025-06-12"
}
Descripción: Actualiza una reserva.

20.

Método: DELETE

URL ejemplo: http://localhost:8000/api/reservas/1

Descripción: Elimina una reserva.