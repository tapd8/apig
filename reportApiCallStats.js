const {getToken, removeToken} = require('./tapdata');
const requestOfcalls = require('request');
const Conf = require('conf');
const config = new Conf();
const apiStatsRptTimeStamp = new Conf({ configName: "apiStatsRptTimeStamp" });
const reportTaskListOfApiStats = new Conf({ configName: "reportTaskListOfApiStats" });

setInterval(() => {

	// let newV = reportApiCallStats.get();
	let needReported = [];
	for (let o of reportTaskListOfApiStats) {
		// console.log(o);
		if (!o[1].reporting) {
			needReported.push(o[1]);
		}
		if (needReported.length >= config.get("apiStatsBatchReport._maxApiStatsBatchSizePerReportPost")) {
			break; // closes iterator, triggers return
		}
	}
	// console.log(needReported);
	reportApiCallStats(needReported);
}, config.get("apiStatsBatchReport._reportIntervals"));


function reportApiCallStats(apiAuditLogs) {
	if (apiAuditLogs && Array.isArray(apiAuditLogs) && apiAuditLogs.length > 0) {
		apiAuditLogs.forEach((apicall) => {
			apicall.report_time = new Date().getTime();
			reportTaskListOfApiStats.set(`${apicall.call_id}.reporting`, true);
		});
		getToken(function (token) {
			let url = config.get("tapDataServer.url") + '/api/ApiCalls?access_token=' + token;
			// console.log(url);
			requestOfcalls.post({
				url: url,
				json: true,
				body: apiAuditLogs,
			}, (err, resp, body) => {
				// console.log("body@reportApiCallStats.js:45:", body);
				if (err || body.error) {
					console.error('err@reportApiCallStats.js:47:', err, body);
					apiAuditLogs.forEach(errCall => {
						reportTaskListOfApiStats.delete(`${errCall.call_id}.reporting`);
					});
				} else if (resp.statusCode === 401 || resp.statusCode === 403) {
					console.error('Access token Expired');
					removeToken();
				} else {
					apiStatsRptTimeStamp.set("lastReport", new Date());
					// console.log("resp:\n", resp);
					// console.log("body:\n", body);
					let reported = Array.isArray(body) ? body : [body];
					reported.forEach((call) => {
						reportTaskListOfApiStats.delete(call.call_id);
					});
				}
			});
		});

	}
}
// exports.reportApiCallStats = reportApiCallStats;
