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
			log.app.info(`${reqId} client ${ip}, ${request.method} ${request.path}, param ${JSON.stringify(args)}`);

			// 认证
			await this.authenticateRequest(request);

			const result = await this.invoke(route, args);
			this.send(response, result);

			const _end = new Date().getTime();
			log.app.info(`${reqId} resp ${JSON.stringify(result)}, time ${_end - _start}ms`);

		} catch (err) {
			this.reject(context, err);
			log.app.error(`${reqId} process request error`, err);
		}
	}
}
