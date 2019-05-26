const request = require('request');

const serverUrl = 'http://127.0.0.1:3080';

/**
 * 测试新增
 * @param cb
 */
const create = function(cb){
	let req = request.post(serverUrl + '/api/v1/order', {
		json: true,
		body: {
			"name": "剃须刀",
			"title": "剃须刀拉拉",
			"tag": ["标签"]
		}
	}, (err, resp, body) => {

		if( resp.statusCode === 200 ){
			console.log(resp.statusCode, body);
		} else {
			console.log(resp.statusCode, body);
		}

		cb(body);
	});
},

updateById = function(data, cb){
	request({
		url: serverUrl + '/api/v1/order/' + data.id,
		method: 'PATCH',
		json: true,
		body: data
	}, (err, resp, body) => {

		console.log(resp.statusCode);

		cb();
	});
},

deleteById = function(id, cb){
	request({
		url: serverUrl + '/api/v1/order/' + id,
		method: 'DELETE'
	}, (err, resp, body) => {

		console.log(resp.statusCode);

		cb();
	});
},

getById = function(id, cb){
	request({
		url: serverUrl + '/api/v1/order/' + id,
		method: 'GET',
		json: true
	}, (err, resp, body) => {

		console.log(resp.statusCode, body);

		cb(body);
	});
},
	/**
	 * filter: {
			"where": {"name": "手机"},
			"fields": {},
			"offset": 0,
			"limit": pageSize,
			"skip": (page-1) * pageSize,
			"order": []
		}
	 *  序列化为
	 * filter[offset]=0&filter[limit]=10&filter[skip]=0&filter[where][name]=test&filter[order][0]=string&filter[order][1]=test
	 *
	 * @param key
	 * @param val
	 * @returns {*}
	 */
	parameterSerialization = function(key, val){
		if( typeof val === 'object'){
			if( Array.isArray(val)){
				let result = [];
				for( let i = 0; i < val.length; i++)
					result.push(parameterSerialization(`${key}[${i}]`, val[i]));
				return result.join("&");
			} else {
				let result = [];
				for( let name in val) {
					if( name && val.hasOwnProperty(name)){
						let temp = parameterSerialization(`${key}[${name}]`, val[name]);
						if( temp)
							result.push(temp);
					}
				}
				return result.join("&");
			}
		} else{
			return `${key}=${val}`;
		}
	},
queryPage = function(page, pageSize, cb){
	request.get(serverUrl + '/api/v1/order?' + encodeURI(parameterSerialization('filter',
		{
			"where": {"name": "手机"},
			"fields": {"name": 1},
			"offset": 0,
			"limit": pageSize,
			"skip": (page-1) * pageSize,
			"order": ['name']
		}
	)), (err, resp, body) => {

		if( err ){
			console.error('查询失败', err);
		}
		console.log(resp.statusCode, body);

		cb(body);
	});
};


/*create((order)=>{

	let id = order._id;
	order.name = '飞利浦剃须刀';
	order.title = '测试修改标题';
	order.id = id;

	updateById(order, ()=>{

		getById(id, (order) => {

			queryPage(1, 10, (list) => {

				deleteById(id, () => {

				});

			});
		});

	});

});*/

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJjbGllbnRJZCI6IjVjMGU3NTBiN2E1Y2Q0MjQ2NGE1MDk5ZCIsInVzZXJfaWQiOiI1YjkyMmQ2NTMxM2E4NDE5MWJkYmI1MWYiLCJjcmVhdGVkQXQiOjE1NTc5OTkyMDEwOTMsInJvbGVzIjpbIjViODM2NjFhNjVhMTY2MzZhN2VhMGNjOSIsIjViOWEwYTM4M2ZjYmEwMjY0OTUyNGJmMSJdLCJleHBpcmVkYXRlIjoxNTU4MDAxMDAxMDkzfQ.d5V9S58GLUjftPjiuPj1ofS9pR0f8FbJegYa6XdTvz8';
const params = parameterSerialization('filter',
	{
		"where": {
			"or": [{
				worker_type: 'api-server'
			}, {
				worker_type: 'tapdata-manager'
			}],
			"and": [{
				ping_time: {
					gte: new Date().getTime() - 6000000
				},
				worker_type: 'tapdata-manager'
			}, {
				ping_time: {
					lte: new Date().getTime() - 30000
				}
			}],
			"name": "test",
			ping_time: {
				lte: new Date().getTime() - 30000
			}
		},
		"fields": {"worker_type": 1, "ping_time": 1},
		"offset": 0,
		"limit": 10,
		"skip": 0,
		"order": 'ping_time DESC'
	}
);
console.log(params);
/*request.get(serverUrl + `/api/v1/Workers?token=${token}&${encodeURI(params)}`, (err, resp, body) => {
	console.log(resp.statusCode, JSON.parse(body));
});*/

const command = ['=', 'gt', 'gte', 'lt', 'lte', 'between', 'inq', 'nin', 'near', 'neq', 'like', 'nlike', 'regexp'];
function standard(condition){
	let conditions = [];
	if(Object.prototype.toString.call(condition) === '[object Array]'){

	} else if( typeof condition === 'object') {
		let keys = Object.keys(condition);
		keys.forEach(key => {
			let value = condition[key];
			if( ['and', 'or'].indexOf(key) >= 0){
				let group = {
					type: 'group',
					operator: key,
					conditions: []
				};
				value.forEach(c => {
					if(Object.keys(c).length > 1){
						group.conditions.push({
							type: 'group',
							operator: 'and',
							conditions: standard(c)
						})
					} else {
						group.conditions = group.conditions.concat(standard(c))
					}
				});
				conditions.push(group)
			} else if(typeof value === 'object' && Object.keys(value).length === 1 && command.indexOf(Object.keys(value)[0])){
				conditions.push({
					type: 'condition',
					field: key,
					command: Object.keys(value)[0],
					value: value[Object.keys(value)[0]]
				})
			} else {
				conditions.push({
					type: 'condition',
					field: key,
					command: '=',
					value: value
				})
			}
		})
	}
	return conditions;
}
/*let standardCondition = standard(flatCondition);
console.log(JSON.stringify(standardCondition, '', '\t'));*/
function flat(condition) {
	if( condition && condition.type === 'group'){
		if( condition.operator === 'and'){
			let result = {};
			condition.conditions.forEach(v => {
				Object.assign(result, flat(v))
			});
			return result;
		} else if(condition.operator === 'or'){
			let result = {
				or: []
			};
			condition.conditions.forEach(v => {
				result.or.push(flat(v))
			});
			return result;
		}
	} else if(condition.type === 'condition'){
		if(condition.command === 'eq'){
			return {
				[condition.field]: condition.value
			}
		} else {
			return {
				[condition.field]: {
					[condition.command]: condition.value
				}
			}
		}
	}
}

let flatCondition = flat({
	'type': 'group',
	'operator': 'and',
	'conditions': [{'type': 'condition', 'field': '', 'command': '', 'value': ''}],
});
console.log(JSON.stringify(flatCondition , '', '\t'));
console.log(JSON.stringify(parameterSerialization('filter', {where: flatCondition}).split('&'), '', '\t'));

