import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import { MySequence } from './sequence';
import * as path from 'path';
// const appConfig = require('../../config');
const Conf = require('conf');
const config = new Conf();

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
        version: config.get('version')
      },
      paths: {},
      servers: [{ url: '/' }],
      externalDocs: {
        description: "Find out more about Tapdata.",
        url: 'https://tapdata.io'
      },
      components: {
        "securitySchemes": {
          /*"ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "access_token"
          },*/
          "OAuth2": {  //arbitrary name for the security scheme
            "type": "oauth2",
            "flows": {
              "clientCredentials": {
                "tokenUrl": (config.get('oAuthBaseUrl') || '') + "/oauth/token",
                "scopes": {}
              },
              "implicit": {
                "authorizationUrl": (config.get('oAuthBaseUrl') || '') + "/oauth/authorize",
                "scopes": {}
              }
            }
          }
        }
      },
      "security": [
        {
          "OAuth2": [],
          //"ApiKeyAuth": []
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
