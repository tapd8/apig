import {OperationRetval, Response, Request} from '@loopback/rest';
import {Readable} from 'stream';
import {ResponseAdapter} from './adapter';

/**
 * Writes the result from Application controller method
 * into the HTTP response
 *
 * @param response - HTTP Response
 * @param result - Result from the API to write into HTTP Response
 */
export function writeResultToResponse(
  // not needed and responsibility should be in the sequence.send
  response: Response,
  // result returned back from invoking controller method
  result: OperationRetval,
): void {
	// Bypass response writing if the controller method returns `response` itself
	// or the response headers have been sent
	if (result === response || response.headersSent) {
		return;
	}

	// @ts-ignore
	let request: Request = response.req;

	if (result === undefined) {
		response.statusCode = 204;
		if(request.headers['client_name']){
			response.end(ResponseAdapter.wrap_response_result(request, response, result));
		} else {
			response.end();
		}
		return;
	}

	const isStream =
	  result instanceof Readable || typeof (result && result.pipe) === 'function';

	if (isStream) {
		response.setHeader('Content-Type', 'application/octet-stream');
		// Stream
		result.pipe(response);
		return;
	}
	switch (typeof result) {
		case 'object':
		case 'boolean':
		case 'number':
			if (Buffer.isBuffer(result)) {
				// Buffer for binary data
				response.setHeader('Content-Type', 'application/octet-stream');
			} else {
				// TODO(ritch) remove this, should be configurable
				// See https://github.com/strongloop/loopback-next/issues/436
				response.setHeader('Content-Type', 'application/json');
				// TODO(bajtos) handle errors - JSON.stringify can throw

				// response adapter
				if(request.headers['client_name']){
					result = ResponseAdapter.wrap_response_result(request, response, result);
				}
				result = JSON.stringify(result);
			}
			break;
		default:
			response.setHeader('Content-Type', 'text/plain');
			result = result.toString();
			break;
	}
	response.end(result);
}
