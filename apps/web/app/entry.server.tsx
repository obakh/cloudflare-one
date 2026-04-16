import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
) {
	let shellRendered = false;
	let status = responseStatusCode;

	const body = await renderToReadableStream(
		<ServerRouter context={routerContext} url={request.url} />,
		{
			onError(error) {
				status = 500;
				if (shellRendered) {
					console.error(error);
				}
			},
		},
	);
	shellRendered = true;

	if (isbot(request.headers.get("user-agent") || "")) {
		await body.allReady;
	}

	responseHeaders.set("Content-Type", "text/html");

	return new Response(body, {
		headers: responseHeaders,
		status,
	});
}
