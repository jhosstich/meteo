import { useEffect, useRef, useState } from "react";

export type TemperatureMsg = {
  time: string;
  value: number;
  unit: string;
  energyKWh: number;
};
const KELVIN = 273.15;
const DIVIDER = 10;
export function useTemperature(streamUrl: string) {
  const [latest, setLatest] = useState<TemperatureMsg | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<number>(1000); // backoff simple
  // const [totalEnergy, setTotalEnergy] = useState(0);

  useEffect(() => {
    let closed = false;

    const connect = () => {
      const es = new EventSource(streamUrl);
      esRef.current = es;



      es.onmessage = (evt) => {
        try {
          const raw = JSON.parse(evt.data);
          const rawValue = parseFloat(String(raw.value)); // en dK
          const celsius = rawValue / DIVIDER - KELVIN;

          // === MODELO INVENTADO ===
          const powerW = celsius * ( Math.ceil(Math.random() * 4) + 5);        // potencia ficticia
          const energyKWh = powerW * (5 / 3600);  // 5 segundos → kWh
          // const newTotal = totalEnergy + energyKWh;
          // setTotalEnergy(newTotal);

          const msg: TemperatureMsg = {
            time: raw.time,
            unit: raw.unit,
            value: parseFloat(celsius.toFixed(2)),
            energyKWh: parseFloat(energyKWh.toFixed(2)),
            
          };
          setLatest(msg);
        } catch {
          // ignora mensajes no JSON (pings, etc.)
        }
      };

      es.addEventListener("end", () => {
        es.close();
      });

      es.onerror = () => {
        es.close();
        console.log("[temperature] Error al conectar");
        // reconexión básica
        if (!closed) {
          const delay = Math.min(retryRef.current, 15000);
          setTimeout(() => connect(), delay);
          retryRef.current *= 2;
        }
      };
    };

    connect();

    return () => {
      closed = true;
      esRef.current?.close();
    };
  }, [streamUrl]);

  return { latest };
}
