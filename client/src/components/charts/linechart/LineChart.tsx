import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface LineChartProps {
    data: any[];                  // lista de datos [{time:..., value:...}, ...]
    xKey: string;                 // nombre del campo para eje X (ej: "time")
    yKey: string;
    y2Key?: string;               // nombre del campo para eje Y (ej: "temperature")
    color?: string;
    YSymbol?: string;
}


export default function LineChart({
    data,
    xKey,
    yKey,
    y2Key,
    color = "#4f46ffff",
    YSymbol,
}: LineChartProps) {

    const CustomMinuteTick = (props: any) => {
        const { x, y, payload, index } = props;
        const full = String(payload.value);
        const minutes = full.slice(0, 5);   // "HH:MM"
        const seconds = full.slice(6, 8);   // "SS"

        // solo marcamos si SS === "00"
        if (seconds !== "00" && index !== 0) return null;

        return (
            <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill="#666"
                fontSize={12}
            >
                {minutes}
            </text>
        );
    };


    return (
        <ResponsiveContainer
            width="100%"     // 👈 se adapta al ancho del padre
            className="line-chart"
        >
            <RechartsLineChart
                responsive={true}
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey={xKey}
                    tick={<CustomMinuteTick />}
                />
                {/* <YAxis dataKey={yKey} /> */}

                <YAxis
                    tick={{ fontSize: 12 }}
                    yAxisId="left"
                    dataKey={yKey}
                    allowDecimals
                    domain={["dataMin - 0.05", "dataMax + 0.05"]}
                    unit={YSymbol}
                    tickFormatter={(value) => value.toFixed(2)}
                />

                {y2Key && <YAxis
                    tick={{ fontSize: 12 }}
                    yAxisId="right"
                    dataKey={y2Key}
                    allowDecimals
                    domain={["dataMin - 0.05", "dataMax + 0.05"]}
                    unit={"kWh"}
                    tickFormatter={(value) => value.toFixed(2)}
                    orientation="right"
                />}
                <Tooltip content={<CustomTooltip />} />

                <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke={color}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                    yAxisId="left"
                />
                <Line
                    type="monotone"
                    dataKey={y2Key}
                    stroke="#300a61ff"
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                    yAxisId="right"
                />
            </RechartsLineChart>
        </ResponsiveContainer>

    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const temp = payload.find((p: any) => p.dataKey === "value"); // tu yKey
    const energy = payload.find((p: any) => p.dataKey === "energyKWh"); // tu y2Key

    return (
        <div style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "8px",
            borderRadius: "4px"
        }}>
            <p><strong>Timestamp: {label}</strong></p>

            {temp && (
                <p style={{ color: temp.color }}>
                    Temperatura: {temp.value.toFixed(2)} ºC
                </p>
            )}

            {energy && (
                <p style={{ color: energy.color }}>
                    Energía: {energy.value.toFixed(2)} kWh
                </p>
            )}
        </div>
    );
};

