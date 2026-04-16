import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("privacy", "routes/policy.tsx"),
	route("terms", "routes/terms.tsx"),
	route("support", "routes/support.tsx"),
	// Add more routes here:
	// route("about", "routes/about.tsx"),
] satisfies RouteConfig;
