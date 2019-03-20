import {inject} from '@loopback/context';
import {
	FindRoute,
	InvokeMethod,
	ParseParams,
	Reject,
	RequestContext,
	RestBindings,
	Send,
	SequenceHandler,
} from '@loopback/rest';
import {AuthenticationBindings, AuthenticateFn} from '@loopback/authentication';
import {log} from './log';

const SequenceActions = RestBindings.SequenceActions;
const excludeAuthPath = ['/', '/explorer', '/openapi.json'];

export class MySequence implements SequenceHandler {
	constructor(
		@inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
		@inject(SequenceActions.SEND) public send: Send,
		@inject(SequenceActions.REJECT) public reject: Reject,
		@inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn
	) {
	}

	async handle(context: RequestContext) {

		const {request, response} = context;
		const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		const _start = new Date().getTime();
		const reqId = `reqId_${_start}_${(Math.random() + '').slice(2)}`;
		try {
			const route = this.findRoute(request);
			const args = await this.parseParams(request, route);
			log.app.debug(`${reqId} client ${ip}, ${request.method} ${request.path}, param ${JSON.stringify(args)}`);

			// 认证
			if( excludeAuthPath.includes(request.path)){
				log.app.debug('exclude auth path ' + request.path);
			} else {
				await this.authenticateRequest(request);
			}

			let result = await this.invoke(route, args);
			const filename = request.query.filename;
			if( filename ){
				response.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
				result = new Buffer(JSON.stringify(result), 'UTF-8');
			} else if( result && result.filename && result.stream ){
				response.setHeader('Content-Disposition', 'attachment; filename="' + result.filename + '"');
				result = result.stream;
			}
			this.send(response, result);

			const _end = new Date().getTime();
			log.app.debug(`${reqId} resp, time ${_end - _start}ms`);

		} catch (err) {
			this.reject(context, err);
			log.app.error(`${reqId} process request error`, err);
		}
	}
}
