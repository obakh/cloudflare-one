import { Link } from "react-router";

const metrics = [
	{ label: "Metric 1", value: "10,000+" },
	{ label: "Metric 2", value: "5,000+" },
	{ label: "Metric 3", value: "1.5M" },
	{ label: "Metric 4", value: "$50M" },
];

export function Metrics() {
	return (
		<div className="grid grid-cols-2 md:flex md:flex-nowrap gap-8 lg:absolute bottom-0 left-0 md:divide-x mt-20 lg:mt-0">
			{metrics.map((metric, index) => (
				<Link to="/stats" key={index}>
					<div className={`flex flex-col text-center ${index === 0 ? "md:pr-8" : "md:px-8"}`}>
						<h4 className="text-muted-foreground text-sm mb-4">{metric.label}</h4>
						<span className="text-2xl text-stroke">{metric.value}</span>
					</div>
				</Link>
			))}
		</div>
	);
}
