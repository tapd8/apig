import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {Request} from 'express';
import {
	AuthenticationBindings,
	AuthenticationMetadata,
	UserProfile,
} from '@loopback/authentication';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import * as appConfig from '../../config.json';
import {log} from '../log';

export class AuthStrategyProvider implements Provider<Strategy | undefined>{

	constructor(
	  @inject(AuthenticationBindings.METADATA)
	  private metadata: AuthenticationMetadata,
	) {

	}

	value(): ValueOrPromise<Strategy | undefined> {
		if (!this.metadata) {
			return undefined;
		}

		const name = this.metadata.strategy;
		if (name === 'JwtStrategy') {
			return new JwtStrategy({
				secretOrKey: appConfig.jwtSecretKey,
				jwtFromRequest: ExtractJwt.fromHeader('token'),
				passReqToCallback: true
			}, this.verify.bind(this));
		} else {
			return Promise.reject(`The strategy ${name} is not available.`);
		}
	}

	verify(
	  request: Request,
	  payload: any,
	  cb: (err: any, user?: UserProfile | false, info?: any) => void,
	) {

		// @ts-ignore
		const apiRoles = this.metadata.options['roles'] || [];

		payload = payload || {};

		const expireDateTime = payload['expiredate'],
		  roles = payload['roles'],
		  user_id = payload['user_id'],
		  name = payload['name'],
		  email = payload['email']
		;

		const reqMethod = request.method,
		  reqPath = request.path;

		log.app.debug(`auth user ${user_id} for ${reqMethod} ${reqPath}, payload is ${JSON.stringify(payload)}, api roles is ${JSON.stringify(apiRoles)}`);


		if( !apiRoles || apiRoles.length === 0){
			log.app.error(`${reqMethod} ${reqPath} not config roles.`);
			cb(null, false, `no role config for path ${reqPath} and method ${reqMethod}`);
			return;
		}

		if( !expireDateTime || !roles || roles.length === 0 || !user_id ){
			cb(null, false, 'invalid token');
			return;
		}
		// 验证过期时间
		if( expireDateTime < new Date().getTime() ){
			cb(null, false, 'token expired');
			return;
		}

		// 验证api角色列表
		// @ts-ignore
		const hasRole = apiRoles.filter( role => roles.includes(role));
		if( hasRole && hasRole.length > 0){
			cb(null, {
				id: user_id,
				name: name,
				email: email
			});
		} else {
			cb(null, false, 'Authorization fail');
		}
	}

}
