import {Response, Request} from '@loopback/rest';
/**
 * response adapter
 */
export namespace ResponseAdapter {

	/**
	 * gitmen response result
	 * @param request
	 * @param response
	 * @param result
	 */
	const gitmen_response_result = function( request: Request, response: Response, result?: Object ){
		if( result === undefined ){
			return {
				error_code: "0",
				error_message: ""
			};
		}

		if( result instanceof Error) {
			return {
				error_code: "1",
				error_message: result.message,
				error_name: result.name
			}
		}

		// @ts-ignore
		if(result[''] && typeof result['error'] === 'object'){ // error message
			// @ts-ignore
			let code = result['error']['statusCode'];
			// @ts-ignore
			let msg = result['error']['message'];
			result = {
				error_code: code,
				error_message: msg
			};
		} else if( request.method === 'GET'){
			// @ts-ignore
			if( Array.isArray(result['data']) && typeof result['total'] === 'object') { // query page result
				// @ts-ignore
				let count = result['total']['count'];
				// @ts-ignore
				let data = result['data'];
				result = {
					error_code: "0",
					error_message: "",
					result: {
						count: count,
						results: data
					}
				};
			} else {
				result = {
					error_code: "0",
					error_message: "",
					result: result
				};
			}
		} else if(request.method === 'PATCH' || request.method === 'DELETE'){
			result = {
				error_code: "0",
				error_message: ""
			};
		} else if( request.method === 'POST') {
			result = {
				error_code: "0",
				error_message: "",
				result: result
			};
		}

		return result;
	};


	export function wrap_response_result(request: Request, response: Response, result?: Object) {

		if (request.headers['client_name'] === 'gitmen') {
			return gitmen_response_result(request, response, result)
		}
		return result;
	}
}
