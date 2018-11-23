import {ApiGatewayApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {ApiGatewayApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new ApiGatewayApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}

export * from './log';