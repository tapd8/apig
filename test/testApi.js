const request = require('request');

/**
 * 测试新增
 * @param cb
 */
const create = function(cb){
	let req = request.post('http://127.0.0.1:3030/order', {
		json: true,
		body: {
			"name": "剃须刀",
			"title": [
				"测试", "^_^"
			],
			"amount": 1000
		}
	}, (err, resp, body) => {

		if( resp.statusCode === 200 ){
			console.log(resp.statusCode + " 新增成功：", body);
		} else {
			console.log(resp.statusCode + " 新增失败：", body);
		}

		cb(body);
	});
},

updateById = function(data, cb){
	request({
		url: 'http://127.0.0.1:3030/order/' + data.id,
		method: 'PATCH',
		json: true,
		body: data
	}, (err, resp, body) => {

		console.log(resp.statusCode + " 更新成功");

		cb();
	});
},

deleteById = function(id, cb){
	request({
		url: 'http://127.0.0.1:3030/order/' + id,
		method: 'DELETE'
	}, (err, resp, body) => {

		console.log(resp.statusCode + " 删除成功");

		cb();
	});
},

getById = function(id, cb){
	request({
		url: 'http://127.0.0.1:3030/order/' + id,
		method: 'GET',
		json: true
	}, (err, resp, body) => {

		console.log(resp.statusCode + " 查询成功", body);

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
					if( val.hasOwnProperty(name)){
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
	request.get('http://127.0.0.1:3030/api/v1/order?' + encodeURI(parameterSerialization('filter',
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
		console.log(resp.statusCode + " 查询成功", body);

		cb(body);
	});
},

getCount = function(){

};


/*create((order)=>{

	order.amount = 2000;
	order.name = '飞利浦剃须刀';
	order.title.push('全自动');

	updateById(order, ()=>{

		getById(order.id, (order) => {

			queryPage(1, 10, (list) => {

				deleteById(order.id, () => {

				});

			});
		});

	});

});*/

queryPage(1, 10, (list) => {
	console.log(list);
});
