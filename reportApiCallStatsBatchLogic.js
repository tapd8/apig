const Conf = require('conf');
const config = new Conf();
const apiStatsRptTimeStamp = new Conf({ configName: "apiStatsRptTimeStamp" });
const reportTaskListOfApiStats = new Conf({ configName: "reportTaskListOfApiStats" });
const cachedApiStats = new Conf({ configName: "cachedApiStats" });

const timer = config.get("apiStatsBatchReport._timeSpanOfScanCachedApiStats");

setInterval(() => {
	let begin = Date.now();
	let last = new Date(apiStatsRptTimeStamp.get("lastReport") || 0);
	if (
		Date.now() - last >= +config.get("apiStatsBatchReport.timeSpanOfTriggerApiStatsBatchReport") ||
		cachedApiStats.size >= +config.get("apiStatsBatchReport.sizeOfTriggerApiStatsBatchReport")
	) {
		for (const capi of cachedApiStats) {
			cachedApiStats.delete(capi[0]);
			reportTaskListOfApiStats.set(capi[0], capi[1]);
			if ((Date.now() - begin) > (timer * 0.8)) {
				break;
			}
		}
	}
}, timer);

