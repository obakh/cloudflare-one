// Validate API token from request headers
export async function validateApiToken(
	request: Request,
	apiToken: string,
): Promise<Response | null> {
	const authHeader = request.headers.get("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return Response.json({ message: "Missing or invalid Authorization header" }, { status: 401 });
	}

	const token = authHeader.replace("Bearer ", "");

	if (token !== apiToken) {
		return Response.json({ message: "Invalid API token" }, { status: 403 });
	}

	return null; // Token is valid
}
