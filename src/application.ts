import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import { MySequence } from './sequence';
import * as path from 'path';
const appConfig = require('../../config');

import {
  AuthenticationComponent,
  AuthenticationBindings,
} from '@loopback/authentication';
import { AuthStrategyProvider } from './providers';

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
        title: 'Tapdata OpenAPI',
        version: appConfig.version
      },
      paths: {},
      servers: [{ url: '/' }],
      /*externalDocs: {
        description: "More info.",
        url: 'http://openapi.mongodb.expert/static/explorer/index.html'
      },*/
      components:{
        "securitySchemes": {
          /*"ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "access_token"
          },*/
          "OAuth2": {  //arbitrary name for the security scheme
            "type": "oauth2",
            "flows": {
              "application": {
                "tokenUrl": (appConfig.oAuthBaseUrl || '') + "/oauth/token",
                "scopes": {}
              },
              "implicit": {
                "authorizationUrl": (appConfig.oAuthBaseUrl || '') + "/oauth/authorize",
                "scopes": {}
              }
            }
          }
        }
      },
      "security": [
        {
			"OAuth2": [],
			"ApiKeyAuth": []
		}
      ]
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
