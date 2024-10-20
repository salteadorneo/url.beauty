import { Chart } from "$fresh_charts/mod.ts";

type Props = {
    type: string;
    labels: string[];
    data: { count: number }[];
};

export default function ChartClient({ type, labels, data }: Props) {
    return (
        <Chart
            type={type}
            width={320}
            height={300}
            data={{
                labels,
                datasets: [
                    {
                        label: "",
                        data: data.map((d) => d.count),
                        backgroundColor: "#EC4899",
                    },
                ],
            }}
        />
    );
}
