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

4. 浏览器访问地质[http://127.0.0.1:3030/apig](http://127.0.0.1:3030/apig)

#### 如何配置？

1. 配置文件
	```shell
	vim config.json
	```

2. 配置文件说明
	```javascript
	{
      "intervals": 30000,   //检查配置文件更新间隔时间，单位为毫秒
      "host": "0.0.0.0",	// api gateway 监听地址
      "port": 3030,			// api gateway 监听端口
      "tapDataServer": {	// tapdataserver 配置
        "url": "http://127.0.0.1/config.json?access_token=ABDcekfsldfseWedfAdfEwgfsdfalpOj"
      },
      "cacheDir": "cache"	// 本地缓存目录
    }
	```


####  
