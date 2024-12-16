const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Sebas2008*MySQL",
  database: "inventario",
});

// Registrar Habitación
app.post("/rooms", async (req, res) => {
  const { numero_habitacion, tipo_habitacion, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO habitaciones (numero_habitacion, tipo_habitacion, status) VALUES (?, ?, ?)`,
      [numero_habitacion, tipo_habitacion, status]
    );
    res.json({ id_habitacion: result.insertId, status: "creado" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Actualizar Estado de Habitación
app.patch("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query(
      `UPDATE habitaciones SET status = ? WHERE id_habitacion = ?`,
      [status, id]
    );
    res.send("Estado de la habitacion actualizado");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3005, () =>
  console.log("Inventory Service running on http://localhost:3005")
);
