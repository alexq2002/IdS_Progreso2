const express = require("express");
const mysql = require("mysql2/promise");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Sebas2008*MySQL",
  database: "reservaciones",
});

// Crear Reserva
app.post("/reservations", async (req, res) => {
  const { numero_habitacion, nombre_cliente, fecha_inicio, fecha_fin } =
    req.body;

  try {
    // Verificar disponibilidad en el servicio SOAP
    const soapRequest = `
            <CheckAvailabilityRequest>
                <StartDate>${fecha_inicio}</StartDate>
                <EndDate>${fecha_fin}</EndDate>
                <RoomType>Doble</RoomType>
            </CheckAvailabilityRequest>
        `;

    const soapResponse = await axios.post(
      "http://localhost:3003/soap",
      soapRequest,
      {
        headers: { "Content-Type": "text/xml" },
      }
    );

    if (!soapResponse.data.includes("<Room>")) {
      return res.status(400).json({ message: "Room not available" });
    }

    // Registrar la reserva
    const [result] = await pool.query(
      `INSERT INTO reservas (numero_habitacion, nombre_cliente, fecha_inicio, fecha_fin, status) VALUES (?, ?, ?, ?, ?)`,
      [numero_habitacion, nombre_cliente, fecha_inicio, fecha_fin, "confirmado"]
    );

    res.json({ id_reservacion: result.insertId, status: "confirmado" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Consultar Reserva
app.get("/reservations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM reservas WHERE id_reservacion = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).send("Reservation not found");
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Cancelar Reserva
app.delete("/reservations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM reservas WHERE id_reservacion = ?`, [id]);
    res.send("Reservacion cancelada");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3004, () =>
  console.log("REST Service running on http://localhost:3004")
);
