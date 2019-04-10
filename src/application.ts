import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {MySequence} from './sequence';
import * as path from 'path';
const appConfig = require('../../config');

import {
	AuthenticationComponent,
	AuthenticationBindings,
} from '@loopback/authentication';
import {AuthStrategyProvider } from './providers';

export class ApiGatewayApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

	this.component(AuthenticationComponent);
	this.bind(AuthenticationBindings.STRATEGY).toProvider(
	  AuthStrategyProvider
	);

    // Set up the custom sequence
    this.sequence(MySequence);

    const startTime = new Date();

    // Set OpenAPI specification
	this.api({
		openapi: '3.0.0',
		info: {
			title: 'API Server',
			version: appConfig.version + `(${startTime.getFullYear()}/${startTime.getMonth()+1}/${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()})`,
		},
		paths: {},
		servers: [{ url: '/' }],
	});

    // Set up default home page
    this.static('/', path.join(__dirname, '../../public'));

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
