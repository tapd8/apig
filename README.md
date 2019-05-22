# 1. Moa

Moa(MongoDB OpenAPI)基于 LoopBack 实现快速将MongoDB Atlas中的数据以RESTful API接口方式发布。
使用MongoDB Atlas + Moa，开发者无需设置应用服务器基础架构即可快速构建应用程序后台。
Moa 通过简单配置即可将MongoDB Atlas中的数据以OpenAPI的方式发布并浏览使用或者提供给开发者使用。


### 传统开发 & 使用 Moa 开发
| 传统方式构建后台 | 使用Maoa | 
| --- | --- | 
| 列出后台接口需求及规范 | 列出后台接口需求及规范 |
| 组织程序员开发后端程序 | 安装API Server 开源模块，本地部署统一认证 |
| 测试功能 | 在Moa平台配置 API，统一配置管理 | 
| 调试bug | 发布API，快速交付 |
| 准备硬件服务器 |  |
| 部署应用程序 |  |
| 部署数据库 |  |
| 配置高可用，权限等设置 |   |
| 测试并上线 |   |

# 2 架构
Moa 由API云端设计器、API Server、MongoDB Atlas三部分组成：

 - API云端设计器：统一配置管理API发布，权限认证
 - API Server ：用户本地环境运行的开源组件，用于执行API发布，提供 RESTful API 接口
 - MongoDB Atlas ：存储配置数据、作为 API Server 的数据源
    
![架构](img/architect.png "架构")

# 3. 如何使用 Moa

## 3.1 准备 Atlas cluster
 - 注册Atlas账号并导入数据 [Login or Register Atlas](https://cloud.mongodb.com/user#/atlas/login)、[MongoDB Atlas](https://docs.atlas.mongodb.com/)、[Import Data Into Cluster](https://docs.atlas.mongodb.com/import/)
 - 配置 Whitelist

## 3.2 注册 Moa 账号
注册地址： http://openapi.mongodb.expert

## 3.3 下载 API Server (分支 hackathon)
```bash
# 检出分支 hackathon 的代码
git clone --single-branch --branch=hackathon https://github.com/tapd8/apig.git

# 安装依赖
cd apig
npm install

```

## 3.4 创建 API Server ID 和 JWT认证密钥
 - 登录 Moa 打开 【API 服务器】 
 - 创建 API Server，下载配置文件
 
 	- 应用名称： 自定义应用名称
 	- 客户端 URL：API Server 运行起来后的访问URL，例如：http://127.0.0.1:3080
 	- JWT 密钥：客户端请求发布API接口时使用的的密钥
 	- 创建完成后，下载配置文件： config.js

![API Server](img/api_server_list.png)

![API Server](img/api_server_create.png)


## 3.5 配置启动 API Server

 - 将下载的 config.js 复制到 API Server 工程的根目录，替换默认 config.js
```bash

# 启动 API Server
npm start

```

## 3.6 配置发布 API

### 3.6.1 创建 MongoDB Atlas 数据源

 - 打开【连接】

![Connection List](img/connection_list.png)


### 3.6.2 创建/设计API

 - 打开【数据发布】
 - 点击【新建】按钮，创建标准增删查改 API 和 创建 自定义查询 API
 
![Create API](img/api_create.png)
![Create Custom API](img/api_custom.png)
 
 
### 3.6.3 发布 API

 - 打开【数据发布】
 - 点击【发布】按钮

![Publish Data](img/publish_api.png)

## 3.7 浏览查询数据

 - 打开【数据浏览】
 - 选择已经发布的 API 查看数据

![Explorer Data](img/data_explorer.png)
![Explorer Data](img/data_explorer_query.png)

## 3.8 调用 OpenAPI 接口，完成业务开发

### 3.8.1 调用 Moa OAuth 认证接口获取 JWT Token
 - POST(x-www-form-urlencoded) 方法请求 [http://openapi.mongodb.expert/oauth/token](http://openapi.mongodb.expert/oauth/token) ，提交参数如下：
```
grant_type: client_credentials					// 固定值
client_id: b5fd01c5996a634320ebf53cbab5fadf			// API Server ID
client_secret: 795a357ff5c2cc895b5a2b8e0a0e883a			// API Server JWT Secret 
scope: api-server						/ 固定值
username: lirufei0808@gmail.com					// 用户登录邮箱
```
 
 - 响应如下：
 ```json
{
"access_token": "eyJhbGciOiJIUzI1NiJ9.eyJjbGllbnRJZCI6ImI1ZmQwMWM1OTk2YTYzNDMyMGViZjUzY2JhYjVmYWRmIiwidXNlcl9pZCI6IjVjZTBiYzUxMzNmZDI5NGI2YTI1YTYzYyIsImNyZWF0ZWRBdCI6MTU1ODM2ODg4NDk0NCwicm9sZXMiOlsiNWNlMGJjNTEzM2ZkMjk0YjZhMjVhNjNjIl0sImV4cGlyZWRhdGUiOjE1NTgzNzA2ODQ5NDR9.fKSCRs2pCNdYYVCYjM-W1OfmQO057EKKOTO1n89Q998",
"expires_in": 1209600,
"scope": "api-server",
"refresh_token": "eyJhbGciOiJIUzI1NiJ9.eyJjbGllbnRJZCI6ImI1ZmQwMWM1OTk2YTYzNDMyMGViZjUzY2JhYjVmYWRmIiwidXNlcl9pZCI6IjVjZTBiYzUxMzNmZDI5NGI2YTI1YTYzYyIsImNyZWF0ZWRBdCI6MTU1ODM2ODg4NDk0NSwicm9sZXMiOlsiNWNlMGJjNTEzM2ZkMjk0YjZhMjVhNjNjIl0sImV4cGlyZWRhdGUiOjE1NTgzNzA2ODQ5NDV9.3p0we5y-XaUKJXVH8_yk6tjd9z-gV7uKK1xiflhjRrk",
"token_type": "Bearer"
}
```
 
### 3.8.2 调用 API 接口获取数据 
 - 查询分页
 	```
	
	 // 请求
	 GET http://127.0.0.1:3083/api/v1/User?filter[order]=name+DESC&filter[limit]=10&filter[skip]=0
	 // 请求头
	 token: eyJhbGciOiJIUzI1NiJ9.eyJjbGllbnRJZCI6ImI1ZmQwMWM1OTk2YTYzNDMyMGViZjUzY2JhYjVmYWRmIiwidXNlcl9pZCI6IjVjZTBiYzUxMzNmZDI5NGI2YTI1YTYzYyIsImNyZWF0ZWRBdCI6MTU1ODM2ODg4NDk0NCwicm9sZXMiOlsiNWNlMGJjNTEzM2ZkMjk0YjZhMjVhNjNjIl0sImV4cGlyZWRhdGUiOjE1NTgzNzA2ODQ5NDR9.fKSCRs2pCNdYYVCYjM-W1OfmQO057EKKOTO1n89Q998
	
	 // 响应
	 {
	 	"data":[{
	 		"_id":"5c7df3f47178c48ec19e5bc5",
	 		"name":"王大为",
	 		"age":10,"desc":["Good","Boy","Happly"],"email":"lrf@gmail.com",
	 		"metadata":{"home_page":"http://www.baidu.com"},"username":"lrf"
	 	},{
	 		...
	 	}],
	 	"total":{
	 		"count":21
	 	}
	 }
	```

 - 创建记录
 - 修改记录
 - 删除记录
 
## 3.9 查看 OpenAPI 接口文档

 - 打开 【数据浏览】
 - 选择 【API Server】，指定要查看 API Server
 - 点击 【API 文档】 打开 API 文档页面

![View API Document](img/view_api.png)
![API Explorer](img/api_explorer.png)
