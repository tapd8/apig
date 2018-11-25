# Api Gateway

基于 LoopBack 实现的 API 应用网关，网关可以自动检测 tap data 配置文件的变化，并自动生成并发布REST API接口。 

#### 如何运行?

1. 检出代码
	```shell
	git clone git@github.com:tapd8/apig.git
	```

2. 安装依赖
	```shell
	cd apig
	npm install
	```

3. 启动
	```shell
	npm start
	```

4. 浏览器访问地址[http://127.0.0.1:3030/apig](http://127.0.0.1:3030/apig)

#### 如何配置？

1. 配置文件
	```shell
	vim config.json
	```

2. 配置文件说明
	```javascript
	let config = {
      "intervals": 30000,   //检查配置文件更新间隔时间，单位为毫秒
      "host": "0.0.0.0",	// api gateway 监听地址
      "port": 3030,			// api gateway 监听端口
      "tapDataServer": {	// tapdataserver 配置
        "url": "http://127.0.0.1/config.json?access_token=ABDcekfsldfseWedfAdfEwgfsdfalpOj"
      },
      "cacheDir": "cache"	// 本地缓存目录
    }
	```


####  Tap data Server 配置文件

```javascript
let config = {
	"apiVersion": "v1",						// api 版本，默认拼接到 API请求地址中: /api/${apiVersion}/${basePath}
	"dataSource": {
		"name": "mongodb",
		"settings": { 						// 数据库连接配置，优先使用url，url为空时使用其他参数拼接
			"url": "mongodb://localhost:27017/test",
			"host": "localhost",
			"port": 27017,
			"user": "",
			"password": "",
			"database": "test"
		}
	},
	"models": [{							// model 配置
		"tablename" : "roles",				// model name
		"basePath" : "roles",				// 拼接到API请求地址中，为空时，默认取值 model name
		"description" : "",					// 模型描述
		"fields" : [
			{
				"field_name" : "_id",		// 字段名称
				"data_type" : "string",	// 数据类型：string, number, array
				"primary_key_position" : 1,	// 主键标识，1-主键, 0或空-非主键
				"required": true, 			// 是否必填,
				"itemType": "string"		// 数组元素数据类型，data_type 为 Array 时有效
			}
		],
		"paths" : [
			{
				"path" : "/{id}",	// 请求资源名称，拼接后的REST API URL 为： /api/${apiVersion}/${basePath}/{id}，不提供时：/api/${apiVersion}/${basePath}
				"method" : "POST",			// 请求方法，POST 新增，PATCH 部分更新，DELETE 删除，GET 查询
				"description" : "create a new record",	// 接口描述
				"filter" : {				// 【针对查询接口有效】如果提供，将会对这个API所有的数据库查询应用此查询条件，与用户查询条件 and 组合
					"name": "aa",			// tapdata 根据用户设置，生成查询条件；主要目的是保留前端灵活性
					"amount": {
						"$gt": 20
					}
				},
				"params" : [				// 【针对查询接口有效】如果提供，用户调用API只能传入以下指定参数；不提供则可以传入 Model 包含的所有字作为查询条件段
					{
						"name" : "name",
						"type" : "string",
						"description" : "角色名词"
					}
				],
				"fields" : [				// 【针对查询接口有效】,如果提供，查询结果只包含指定的字段
					"id", "name", "parent"
				]
			}
		]
	} ]
}


```
