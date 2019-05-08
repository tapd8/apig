# Api Gateway

基于 LoopBack 实现的 API 应用网关，网关可以自动检测 tapdata 配置文件的变化，并自动生成并发布RESTful API接口。 

#### 如何运行?

##### 运行环境：
1. 暂不支持Windows OS。请使用Linux，如debian，ubuntu。
2. node 10 LTS+

##### 运行步骤：
1. 检出代码
	```shell
	git clone git@github.com:tapd8/apig.git
	```

2. 安装依赖
	```shell
	cd apig
	npm install
	```
3. 设置参数：config.js
4. 启动
	```shell
	
	# 运行环境可以通过命令行参数指定
	
	npm start [dev|test]
	
	# 或者
	
	./start.sh [dev|test]
	```

5. 浏览器访问地址[http://127.0.0.1:3030/apig](http://127.0.0.1:3030/apig)

#### 如何打包

```shell

# 1. 安装依赖
npm install

# 2. 打包
./pkg.sh

```

#### 部署及调试

参见 deploy/howtoRunTpl.md

####  Tapdata Server 配置文件

```javascript
let config = {
	"dataSource": [{
		"name": "mongodb",
		"settings": { 						// 数据库连接配置，优先使用url，url为空时使用其他参数拼接
			"url": "mongodb://localhost:27017/test",
			"host": "localhost",
			"port": 27017,
			"user": "",
			"password": "",
			"database": "test"
		}
	}],
	"models": [{							// model 配置
		"tablename" : "roles",				// model name
		"dataSourceName": "mongodb",		// 必须，指定这个model的api使用那个数据源 
		"basePath" : "roles",				// 拼接到API请求地址中，为空时，默认取值 model name
		"description" : "",					// 模型描述
		"apiVersion": "v1",					// api 版本，默认拼接到 API请求地址中: /api/${apiVersion}/${basePath}
		"fields" : [
			{
				"field_name" : "_id",		// 字段名称
				"data_type" : "string",	// 数据类型：string, number, array
				"primary_key_position" : 1,	// 主键标识，1-主键, 0或空-非主键
				"required": true, 			// 是否必填,
				"itemType": "string",		// 数组元素数据类型，data_type 为 Array 时有效
				"description": ""			// 字段描述
			}
		],
		"paths" : [
			{
				"name": "create",			// 可选值："create", "findById", "updateById", "deleteById", "findPage"
				"type": "preset", 			// 预设API
				"roles": [					// 可以访问当前api的角色id列表
					"role id 1", "role id 2"
				]
			},
			{
				"type": "custom",			// 自定义API
				"path" : "/order",			// 【必填项】请求资源名称，拼接后的REST API URL 为： /api/${apiVersion}/${basePath}/order
				"description" : "自定义方法查询",	// 接口描述
				"filter" : {				// 【针对查询接口有效】如果提供，将会对这个API所有的数据库查询应用此查询条件，与用户查询条件 and 组合
					"name": "aa",			// tapdata 根据用户设置，生成查询条件；主要目的是保留前端灵活性
					"amount": {
						"gt": 20			// 可用关键字列表：gt: '>', gte: '>=', ne: '!=', lt: '<', lte: '<=', like: 'LIKE', nlike: 'NOT LIKE', inq: 'IN', nin: 'NOT IN'
					}
				},
				"fields" : [				// 【针对查询接口有效】,如果提供，查询结果只包含指定的字段
					"_id", "name", "parent"
				],
				"roles": [					// 可以访问当前api的角色id列表
					"role id 1", "role id 2"
				]
			}
		]
	} ]
}

```

#### JWT token payload 格式
```javascript
let payload = {
	"expiredate": 156435432,                  // 必填,过期时间戳，与当前系统时间比较，小于系统时间时，认定为过期
	"roles": ['role id 1', 'role id 2',],      // 必填,当前用户角色列表
	"user_id": "1",								// 必填,用户id
	"name":"Jack",								// 可空,用户名
	"email": "jack@gmail.com"					// 可空,用户邮箱
 }
```

#### 如何测试？

1. 运行 API Gateway
2. 指定 tapdata server 配置为 test/config.json
3. 运行测试用例 test/testApi.js
