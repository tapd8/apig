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
import {log} from './log';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
	constructor(
		@inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
		@inject(SequenceActions.SEND) public send: Send,
		@inject(SequenceActions.REJECT) public reject: Reject,
	) {
	}

	async handle(context: RequestContext) {
		try {
			const _start = new Date().getTime();
			const {request, response} = context;
			const route = this.findRoute(request);
			const args = await this.parseParams(request, route);
			const result = await this.invoke(route, args);
			this.send(response, result);

			const _end = new Date().getTime();
			const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

			log.app.info(`client ${ip}, ${request.method} ${request.path}, param ${JSON.stringify(args)}, time ${_end - _start}ms`);
		} catch (err) {
			this.reject(context, err);
			log.app.error('process request error', err);
		}
	}
}
