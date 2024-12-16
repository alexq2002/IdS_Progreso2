const express = require("express");
const { parseString } = require("xml2js");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.text({ type: "text/xml" }));

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Sebas2008*MySQL",
  database: "habitaciones",
});

// Endpoint SOAP
app.post("/soap", async (req, res) => {
  const xml = req.body;

  parseString(xml, async (err, result) => {
    if (err) return res.status(400).send("Invalid XML");

    const { StartDate, EndDate, RoomType } = result.CheckAvailabilityRequest;

    try {
      const [rows] = await pool.query(
        `SELECT * FROM disponibilidad WHERE tipo_habitacion = ? AND fecha_disponibilidad BETWEEN ? AND ? AND status = 'disponible'`,
        [RoomType[0], StartDate[0], EndDate[0]]
      );

      const response = `
                <CheckAvailabilityResponse>
                    <AvailableRooms>
                        ${rows
                          .map(
                            (room) => `
                            <Room>
                                <RoomId>${room.id_habitacion}</RoomId>
                                <RoomType>${room.tipo_habitacion}</RoomType>
                                <AvailableDate>${room.fecha_disponibilidad}</AvailableDate>
                                <Status>${room.status}</Status>
                            </Room>
                        `
                          )
                          .join("")}
                    </AvailableRooms>
                </CheckAvailabilityResponse>
            `;
      res.type("text/xml").send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.listen(3003, () =>
  console.log("SOAP Service running on http://localhost:3003/soap")
);
