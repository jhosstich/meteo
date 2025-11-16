import { useTemperature } from "../hooks/useTemperature";
import './index.scss'
import { useEffect, useState } from "react";
import type { TemperatureMsg } from "../hooks/useTemperature";
import LineChart from "../components/charts/linechart/LineChart";
export default function Home() {
  // Con proxy de Vite puedes usar /api en vez de localhost:4000
  const { latest } = useTemperature("/api/temperature-stream");

  const [temperatures, setTemperatures] = useState<TemperatureMsg[]>([]);
  useEffect(() => {
    if (latest) {
      setTemperatures((prev) => [...prev, latest]);
    }
  }, [latest]);



  return (
    <div id="home" >
      <h1>Meteo Dashboard</h1>


      <div className="line-chart-card-container">
        <div className="line-chart-container">
          <h2>Temperatura en tiempo real</h2>
          <LineChart
            data={temperatures}
            xKey="time"
            yKey="value"
            y2Key="energyKWh"
            color="#ff3300e8"
            YSymbol="ºC"
          />
        </div>


        <div className="card">
          <h2>Última lectura recibida</h2>

          <p> <strong>Temperatura:</strong>
            <span className="text-value">{latest
              ? `${latest.value} ºC`
              : "Esperando datos…"}</span>
          </p>
          <p> <strong>Energía producida:</strong>
            <span className="text-value">{latest
              ? `${latest.energyKWh} kWh`
              : "Esperando datos…"}</span>
          </p>

          <p> <strong>Timestamp:</strong>
            <span className="text-value">{latest
              ? `${latest.time}`
              : "Esperando datos…"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
