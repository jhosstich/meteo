import fs from "fs";
import path from "path";
import YAML from "yaml";
import { Response } from "express";
import { TemperatureValues, TemperatureYaml, TimeValue } from "../types/temperature";

const YAML_PATH = path.join(process.cwd(), "public", "data", "data.yml");
const STEP_MS = 5000;


const hmsToSec = (hms: string) => {
    const [hh, mm, ss] = hms.split(":").map(Number);
    return hh * 3600 + mm * 60 + ss;
};
const serverTimeToSec = () => {
    const d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
};

export class TemperatureService {
    private series: TemperatureValues = { unit: "dK", values: [] };

    constructor() {
        this.load();
        // try {
        //     fs.watch(YAML_PATH, { persistent: false }, () => {
        //         console.log("[temperature] YAML modificado. Recargando…");
        //         this.load();
        //     });
        // } catch {
        //     console.log("[temperature] Error al iniciar el watcher");
        // }
    }

    /** Returns all values */
    getSeries(): TemperatureValues {
        return this.series;
    }

    /** Send values as SSE */
    streamTo(res: Response) {
        const { values } = this.series;

        res.set({
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        res.flushHeaders?.();

        if (!values.length) {
            res.write(`event: end\n`);
            res.write(`data: {"message": "No data"}\n\n`);
            res.end();
            return;
        }

        const nowSec = serverTimeToSec();
        let index = 0; // índice del último valor <= hora servidor

        for (let k = 0; k < values.length; k++) {
            if (values[k].hsmtoSec <= nowSec) index = k;
            else break; // values ordenado asc por hsmtoSec
        }

        // Si la hora del servidor está por delante del último dato,
        // empezamos desde el principio para seguir emitiendo.
        if (nowSec > values[values.length - 1].hsmtoSec) {
            index = 0;
        }

        this.send(index, res);

        let interval: NodeJS.Timeout | null = null;
        let firstTimeout: NodeJS.Timeout | null = null;

        const scheduleNexts = (baseSec: number) => {
            const nextIndex = index + 1;

            // Si no hay más datos, cerrar
            if (nextIndex >= values.length) {
                res.write("event: end\n");
                res.write(`data: {"message":"No more data"}\n\n`);
                res.end();
                return;
            }

            const next = values[nextIndex];

            // diferencia en segundos desde el "momento base"
            const diffSec = next.hsmtoSec - baseSec;
            const delayMs = Math.max(0, diffSec * 1000); // segundos → ms
            console.log("[temperature] diffSec", diffSec, "delayMs", delayMs);

            // 1er envío alineado a la marca de tiempo real del siguiente dato
            firstTimeout = setTimeout(() => {
                index = nextIndex;
                this.send(index, res);

                // A partir de aquí ya vamos cada STEP_MS (5s)
                interval = setInterval(() => {
                    index++;
                    if (index >= values.length) {
                        res.write("event: end\n");
                        res.write(`data: {"message":"No more data"}\n\n`);
                        if (interval) clearInterval(interval);
                        res.end();
                        return;
                    }
                    this.send(index, res);
                }, STEP_MS);
            }, delayMs);
        };

        // baseSec = hora actual del servidor para calcular el desfase del primer envío
        scheduleNexts(nowSec);

        res.on("close", () => {
            interval && clearInterval(interval);
            firstTimeout && clearTimeout(firstTimeout);
            //clearInterval(keepalive);
            res.end();
        });
    }
    /** load yaml file */
    private load() {
        try {
            const raw = fs.readFileSync(YAML_PATH, "utf-8");
            const parsed = YAML.parse(raw) as TemperatureYaml;

            const unit: string = parsed?.temperature?.unit ?? "dK";
            const values: TimeValue[] = parsed?.temperature?.values ?? [];

            const normalizedValues = values.map(v => ({
                time: v.time,
                value: v.value,
                hsmtoSec: hmsToSec(v.time)
            }));

            this.series = { unit, values: normalizedValues };
            console.log(`[temperature yaml] ${normalizedValues.length} points were loaded. unit=${unit}`);
        } catch (err) {
            console.error("[temperature yaml] Error loading:", err);
            this.series = { unit: "dK", values: [] };
        }
    }

    private send = (i: number, res: Response) => {
        const current = this.series.values[i];
        const payload = { time: current.time, value: current.value, unit: this.series.unit };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
}

export const temperatureService = new TemperatureService();
