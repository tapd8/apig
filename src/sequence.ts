import { inject } from '@loopback/context';
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
import { AuthenticationBindings, AuthenticateFn } from '@loopback/authentication';
import { log } from './log';
// const appConfig = require('../../config');
// const reportApiCallStats = require('../../reportApiCallStats');
// const getToken = require('../../tapdata').getToken;
const Conf = require('conf');
const config = new Conf();


const SequenceActions = RestBindings.SequenceActions;
const excludeAuthPath = ['/', '/explorer', '/openapi.json'];

export class MySequence implements SequenceHandler {
	// private enableApiStats: boolean = (config.get("enableApiStats") == 'true');
	// private needBatchReportApiStats: boolean = false;
	private cachedApiStats = new Conf({ configName: "cachedApiStats" });
	// private reportTaskListOfApiStats = new Conf({ configName: "reportTaskListOfApiStats" });

	constructor(
		@inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
		@inject(SequenceActions.SEND) public send: Send,
		@inject(SequenceActions.REJECT) public reject: Reject,
		@inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,
	) {

		// let self = this;
		// setInterval(() => {
		// 	// the latest value can be obtained well from cross process ,
		//  // so such polling is for performance optimization,
		//  // prevent getting value from the config.json file by synchronization io on each report
		// 	self.enableApiStats = (config.get("enableApiStats") == 'true');
		// }, 10 * 1000);
		// setInterval(() => {
		// 	//@ts-ignore
		// 	process.needBatchReportApiStats = true;
		// 	// self.needBatchReportApiStats = true;
		// }, 5 * 1000);

	}

	// setApiStats(enable: boolean) {
	// 	this.enableApiStats = enable;
	// }

	async handle(context: RequestContext) {

		// log.app.debug(context);

		let apiAuditLog = {};
		// {
		// 	'call_id': '',
		// 	'allPathId': 'xxxxxxxxxxxxxxx',
		// 	'method': 'XXXX',
		// 	'api_path': 'xxxxxxxxxxxxxx',
		// 	'api_name': 'xxxxxxxxxxxxxx',
		// 	'req_path': 'xxxxxxxxxxxxxxxxxx',
		// 	'req_params': 'xxxxxxxxxxxxxxxxxx',
		// 	'req_headers': {},
		// 	'req_time': 0, //timestamp
		// 	'res_time': 0, //timestamp
		// 	'latency': 0, //ms,delta time
		// 	'req_bytes': 0,
		// 	'res_bytes': 0,
		// 	'res_rows': 0,
		// 	'user_ip': 'xxxxxxxxxx',
		// 	'user_port': 'xxxx',
		// 	'api_worker_uuid': 'xxxxxxxxxxxxxxxxxxxxxx',
		// 	'api_worker_ip': 'xxxxxxxxxxxxxx',
		// 	'api_worker_port': 0,
		// 	'api_gateway_uuid': 'xxxxxxxxxxxxxxxxxxxxx',
		// 	'api_gateway_ip': 'xxxxxxxxxxxx',
		// 	'api_gateway_port': 0,
		// 	'code': 0,
		// 	'codeMsg': 'xxxxxxxxxxx',
		// 	'user_id': 'xxxxxxxxxxxxxxx',
		// 	"report_time": 0 //timestamp,该监控日志的上报时间
		// };


		const { request, response } = context;

		let resEndHandler = (err: Error) => {

			const _end = new Date().getTime();
			//@ts-ignore
			apiAuditLog.latency = _end - _start;
			//@ts-ignore
			apiAuditLog.req_time = _start;
			//@ts-ignore
			apiAuditLog.res_time = _end;

			// log.app.debug(`${reqId} resp, time ${_end - _start} ms`);

			if (err) {
				log.app.error(err);
			}

			//@ts-ignore
			let user_info: object = request['user_info'] || {};
			//@ts-ignore
			let api_meta: object = request['api_meta'] || { options: {} };
			//@ts-ignore
			apiAuditLog.api_meta = api_meta;
			//@ts-ignore
			apiAuditLog['user_info'] = user_info;
			//@ts-ignore
			apiAuditLog.user_id = user_info.user_id;
			//@ts-ignore
			apiAuditLog.allPathId = api_meta.options.allPathId;
			//@ts-ignore
			apiAuditLog.api_path = api_meta.options.pathTpl;
			//@ts-ignore
			apiAuditLog.api_name = api_meta.options.rawName;
			//@ts-ignore
			apiAuditLog.call_id = reqId;
			//@ts-ignore
			apiAuditLog.user_ip = `${ip}`;
			//@ts-ignore
			apiAuditLog.user_ips = request.ips;
			//@ts-ignore
			apiAuditLog.user_port = `${port}`;
			//@ts-ignore
			apiAuditLog.req_path = request.path;
			//@ts-ignore
			apiAuditLog.method = request.method;
			//@ts-ignore
			apiAuditLog.api_gateway_ip = request.connection.localAddress;
			//@ts-ignore
			apiAuditLog.api_gateway_port = request.connection.localPort;
			//@ts-ignore
			apiAuditLog.api_worker_ip = request.connection.localAddress;
			//@ts-ignore
			apiAuditLog.api_worker_port = request.connection.localPort;

			// https://stackoverflow.com/questions/38423930/how-to-retrieve-client-and-server-ip-address-and-port-number-in-node-js

			// log.app.debug(
			// 	// appConfig,
			// 	// request.headers,
			// 	request.socket.bytesRead,
			// 	// https://stackoverflow.com/questions/32295689/how-to-get-byte-size-of-request
			// 	request.connection.remoteAddress,
			// 	request.connection.remotePort,
			// 	request.connection.localAddress,
			// 	request.connection.localPort
			// );
			//@ts-ignore
			apiAuditLog.api_worker_uuid = config.get("reportData.process_id");
			//@ts-ignore
			apiAuditLog.api_gateway_uuid = config.get("reportData.process_id");
			//@ts-ignore
			apiAuditLog.req_headers = request.headers;
			//@ts-ignore
			apiAuditLog.req_bytes = request.socket.bytesRead;
			//@ts-ignore
			apiAuditLog.code = response.statusCode;
			//@ts-ignore
			apiAuditLog.codeMsg = response.statusMessage;

			// log.app.debug(response.connection);

			// log.app.debug(request.socket.server);
			//@ts-ignore
			apiAuditLog.req_bytes = request.socket.bytesRead;
			//@ts-ignore
			apiAuditLog.res_bytes = request.socket.bytesWritten;

			// console.log('apiAuditLog@resEndHandler@src/sequence.ts:141\n', apiAuditLog);

			if (config.get("apiStatsBatchReport.enableApiStatsBatchReport") == 'true') {
				//@ts-ignore
				this.cachedApiStats.set(apiAuditLog.call_id, apiAuditLog);

				// console.log('cachedApiStats@resEndHandler@src/sequence.ts:184\n', this.cachedApiStats)

				// } else {
				// 	if (config.get("enableApiStatsAtomReport") == 'true') {
				// 		//@ts-ignore
				// 		this.reportTaskListOfApiStats.set(apiAuditLog.call_id, apiAuditLog);
				// 		// reportApiCallStats([apiAuditLog]);

				// 	}

			}

			// if (this.needBatchReportApiStats || this.cachedApiStats.length >= 1000) {
			// 	let statsDataNeedReport = this.cachedApiStats;
			// 	this.cachedApiStats = [];
			// 	this.needBatchReportApiStats = false;

			// 	// send to server
			// 	console.log(`config.get("enableApiStats")@src/sequence.ts:150:`, config.get("enableApiStats"));
			// 	if (config.get("enableApiStats") == 'true') {
			// 		// if (this.enableApiStats) {

			// 	}

			// }

		};

		// let requestStats = require('request-stats');
		// let stats = requestStats(request, response);
		// stats.on('complete', (s: any) => {
		// 	apiAuditLog.latency = s.time;
		// 	// log.app.debug(s);
		// });

		response.on('finish', resEndHandler);
		response.on('error', resEndHandler);


		const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		const port = request.headers['x-forwarded-port'] || request.connection.remotePort;
		const _start = new Date().getTime();
		const reqId = `reqId_${_start}_${(Math.random() + '').slice(2)}`;
		try {
			const route = this.findRoute(request);
			// log.app.debug("route:", route);
			const args = await this.parseParams(request, route);
			log.app.debug(`${reqId} client ${ip}, ${request.method} ${request.path}, param ${JSON.stringify(args)}`);
			//@ts-ignore
			apiAuditLog.req_params = `${JSON.stringify(args)}`;

			// 认证
			if (excludeAuthPath.includes(request.path)) {
				log.app.debug('exclude auth path ' + request.path);
			} else {
				let rt = await this.authenticateRequest(request);
				// log.app.debug(rt);
				// if (rt) {
				// 	apiAuditLog.user_id = rt.id;
				// }
				// else {
				// 	log.app.error("authenticateRequest return null or undefine: ", rt);
				// }

			}

			let result = await this.invoke(route, args);

			//log.app.debug('result@src/sequence.ts:180\n', result);
			if (result) {
				if (result.data) {
					//@ts-ignore
					apiAuditLog.res_rows = result.data.length ? result.data.length : 0;

					if (config.get("filterNull")) {
						// @ts-ignore
						result.data.forEach(row => {
							for (const key in row) {
								if (row.hasOwnProperty(key)) {
									const element = row[key];
									if ( element === "null" || element === "" || element === null || element === undefined) {
										delete row[key];
									}
								}
							}

						});

					}

				} else {
					//@ts-ignore
					apiAuditLog.res_rows = 1;
				}
			}

			const filename = request.query.filename;
			const type = request.query.type || 'json';
			if (filename) {
				response.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
				result = this.convertToBuffer(type, result);
			} else if (result && result.filename && result.stream) {
				response.setHeader('Content-Disposition', 'attachment; filename="' + result.filename + '"');
				result = result.stream;
			}
			this.send(response, result);

		} catch (err) {
			this.reject(context, err);
			log.app.error(`${reqId} process request error`, err);
		}
	}

	convertToBuffer(type: String, data: object) {
		type = type ? type.toLowerCase() : 'json';
		if (type === 'json') {
			return Buffer.from(JSON.stringify(data), 'utf8');
		} else if (type === 'csv') {
			let separatedBy = ',';
			let delimiter = '"';
			data = data || {};
			// @ts-ignore
			let records = Array.isArray(data['data']) ? data['data'] : [data['data']];
			if (records.length > 0) {
				let fields = Object.keys(records[0]);
				let contents: string[] = [];
				let row: string[] = [];
				fields.forEach(v => row.push(`${delimiter}${v}${delimiter}`));
				contents.push(row.join(separatedBy));
				records.forEach((record: object) => {
					let row: string[] = [];
					// @ts-ignore
					fields.forEach(v => row.push(`${delimiter}${typeof record[v] === 'object' ? JSON.stringify(record[v]) : (record[v] || '')}${delimiter}`));
					contents.push(row.join(separatedBy));
				});
				let content = contents.join("\n");
				return Buffer.from(content, 'utf8');
			}
		} else {
			return Buffer.alloc(0);
		}
	}
}


