import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {Request} from 'express';
import {
	AuthenticationBindings,
	AuthenticationMetadata,
	UserProfile,
} from '@loopback/authentication';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
const appConfig = require('../../../config');
import {log} from '../log';

const publicKey =
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwnEhVBLrafADQY8XWiAJ
kApaqD6QGY95oQjp4Xg4Tg77phn3bTzXULGWDlwehuMQChQZeprg296TLQalAKQR
N8dUdqbbWdnidx9/k6mcD6CFlCIarNH9LXhoOxAMcI+WhKBbgUZwhP/psC6k4Bq8
KkNUsMXG3u/MycLzKl4Tqu1vQP0da35d6Z1UigpB6IqsdBss0FmgcK1NnQUHQeL1
mMuJiU8N5cSd+h+r4NjfsRwJx2yklcH+JqlZtu1Q2DgIPSYvqPVGGeG8thptWnVF
WhF1LttOU9Lq0fZvm0YHLInGfbaJsjajCFzpiQxsvxdB8bjIPXY35fEAnAKqAOcE
6QIDAQAB
-----END PUBLIC KEY-----
`;
/*
payload: {
  roles: [ '$everyone' ],
  user_id: '1',
  name: 'Guest user',
  expiredate: 1561470639647
}*/
const guestUserToken = 'eyJhbGciOiJSUzI1NiJ9.eyJyb2xlcyI6WyIkZXZlcnlvbmUiXSwidXNlcl9pZCI6IjEiLCJuYW1lIjoiR3Vlc3QgdXNlciIsImV4cGlyZWRhdGUiOjE1NjE0NzA2Mzk2NDd9.ec5sPJPkqN_plCwQwWHxrHPww4qZg9HrBjes6EllaL8mzQUuEtrKyd-Mw6185DQN2fda0K0vjqsxvzV6GUVakcjbNaulLSWoJRpRkjg_GOt1QWYvRfLHKPI3ga9H_7Wo9t11_C4-P6bvgBVn9kH5h7o3mThVElCgUwqXiJc0S_f3HtbmeJ33BRLgkdl-F_4K02124zGZ5x7orVbze4x5YJYeNNFdCV7MvtjjO_FdVEZWD5Cu5YGiu3cA9AV7nMu1kp6CCSDBGBSB-y9trxXYCqsG8UVOkiycwMM6IK621XpQ5Tqr_JNr8Hm3W3tMBQPJYtoWbbKz6OK3dg1re8NVWA';

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
			const
				fromHeader = ExtractJwt.fromHeader('token'),
				fromQuery = ExtractJwt.fromUrlQueryParameter('token'),
				fromBody = ExtractJwt.fromBodyField('token');
			return new JwtStrategy({
				secretOrKey: publicKey,
				algorithms: ['RS256'],
				jwtFromRequest: function(request){
					let token = null;

					token = fromHeader(request);
					if( token )
						return token;

					token = fromBody(request);
					if( token )
						return token;

					token = fromQuery(request);
					if( token )
						return token;

					token = guestUserToken;

					return token;
				},
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

		const name = payload['name'],
		  expireDateTime = name === 'Guest user' ? new Date().getTime() + 60000: payload['expiredate'],
		  roles = payload['roles'],
		  user_id = payload['clientId'],
		  email = payload['email']
		;

		const reqMethod = request.method,
		  reqPath = request.path;

		log.app.debug(`auth user ${user_id} for ${reqMethod} ${reqPath}, payload is ${JSON.stringify(payload)}, api roles is ${JSON.stringify(apiRoles)}`);

		// @ts-ignore
		request["user_info"] = payload;
		// @ts-ignore
		request["api_meta"] = this.metadata;


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
		const hasRole = apiRoles.filter( role => '$everyone' === role || roles.includes(role));
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
