import {LogError, Reject, HandlerContext, RestBindings} from '@loopback/rest';
import {inject, Provider} from '@loopback/context';
import {HttpError} from 'http-errors';
import {writeErrorToResponse, ErrorWriterOptions} from 'strong-error-handler';
import {ResponseAdapter} from './adapter';

// TODO(bajtos) Make this mapping configurable at RestServer level,
// allow apps and extensions to contribute additional mappings.
const codeToStatusCodeMap: {[key: string]: number} = {
	ENTITY_NOT_FOUND: 404,
};

export class RejectProvider implements Provider<Reject> {
	constructor(
	  @inject(RestBindings.SequenceActions.LOG_ERROR)
	  protected logError: LogError,
	  @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
	  protected errorWriterOptions?: ErrorWriterOptions,
	) {}

	value(): Reject {
		return (context, error) => this.action(context, error);
	}

	action({request, response}: HandlerContext, error: Error) {
		const err = <HttpError>error;

		if (!err.status && !err.statusCode && err.code) {
			const customStatus = codeToStatusCodeMap[err.code];
			if (customStatus) {
				err.statusCode = customStatus;
			}
		}

		const statusCode = err.statusCode || err.status || 500;

		// response adapter
		if(request.headers['client_name']){
			let result = ResponseAdapter.wrap_response_result(request, response, err);
			response.statusCode = 200;
			result = result ? JSON.stringify(result) : undefined;
			response.end(result);
		} else {
			writeErrorToResponse(err, request, response, this.errorWriterOptions);
		}
		this.logError(error, statusCode, request);
	}
}
