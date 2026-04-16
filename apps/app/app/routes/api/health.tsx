export async function loader() {
	return Response.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		version: "1.0.0",
	});
}
