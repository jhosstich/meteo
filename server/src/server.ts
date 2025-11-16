// src/server.ts
import express from "express";
import { temperatureService } from "./services/temperature.service";

const app = express();
const PORT = 4000;

app.get("/temperature-stream", (req, res) => temperatureService.streamTo(res));

app.get('/', (req, res) => {
  res.send('connected!')
})


app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT}`);
});
