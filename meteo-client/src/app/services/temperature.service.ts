import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TemperatureMsg {
  time: string;
  value: number;     // ºC
  unit: string;
  energyKWh: number; // kWh
}

const KELVIN = 273.15;
const DIVIDER = 10;

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  private es?: EventSource;
  private latestSubject = new BehaviorSubject<TemperatureMsg | null>(null);
  latest$ = this.latestSubject.asObservable();

  constructor(private zone: NgZone) {
    this.connect(environment.apiUrl + '/temperature-stream'); 
  }
// conecta al backend
  private connect(url: string) {
    if (this.es) return;
    try {
      console.log('[temperature] conectando SSE a', url);
      const es = new EventSource(url);
      this.es = es;

      es.onmessage = (evt) => {
        this.zone.run(() => {
          try {
            const raw = JSON.parse(evt.data);
            const rawValue = parseFloat(String(raw.value)); // dK
            const celsius = rawValue / DIVIDER - KELVIN;

            const powerW = celsius * (Math.ceil(Math.random() * 4) + 5);
            const energyKWh = powerW * (5 / 3600); // 5s → kWh

            const msg: TemperatureMsg = {
              time: raw.time,
              unit: raw.unit,
              value: parseFloat(celsius.toFixed(2)),
              energyKWh: parseFloat(energyKWh.toFixed(2)),
            };

            console.log('[temperature] nuevo valor en servicio', msg);
            this.latestSubject.next(msg);
          } catch (e) {
            console.error('[temperature] error parseando SSE', e);
          }
        });
      };

      es.onerror = (err) => {
        console.error('[temperature] SSE error', err);
        es.close();
        this.es = undefined;
      };
    } catch (e) {
      console.error('[temperature] error conectando al servidor', e);
    }
  }

  disconnect() {
    if (this.es) {
      console.log('[temperature] cerrando SSE');
      this.es.close();
      this.es = undefined;
    }
  }
}
