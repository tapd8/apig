const config = {
	"apiVersion": "v1.0.1",
	"dataSource": {
		"name": "mongodb",
		"settings": {
			"url": "mongodb://localhost:27017/test",
			"host": "localhost",
			"port": 27017,
			"user": "",
			"password": "",
			"database": "test"
		}
	},
	"models":[{
		"name": "order",
		"httpPathName": "order",
		"properties": {
			"id": {"type": "string", "id": true },
			"name": {"type": "string", "required": true},
			"title": {"type": "array", "itemType": "string", "required": true},
			"amount": {"type": "number"},
			"desc": {"type": "buffer"}
		}
	}]
};

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
queryPage = function(page, pageSize, cb){
	request({
		url: 'http://127.0.0.1:3030/order',
		method: 'GET',
		json: true,
		filter: {
			"where": {},
			"fields": {},
			"offset": 0,
			"limit": pageSize,
			"skip": (page-1) * pageSize,
			"order": []
		}
	}, (err, resp, body) => {

		console.log(resp.statusCode + " 查询成功", body);

		cb(body);
	});
},

getCount = function(){

};


create((order)=>{

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

});

