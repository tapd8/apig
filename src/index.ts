import {ApiGatewayApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {log} from './log';

export {ApiGatewayApplication};

export async function main(options: ApplicationConfig = {}, cb ?: (result : boolean) => {}) {
  const app = new ApiGatewayApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
	log.app.info(`Server is running at ${url}`);
	console.log(`Server is running at ${url}`);

	if( cb )
	  cb(true);

  return app;
}

export * from './log';