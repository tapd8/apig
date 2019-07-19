
const jwt = require('jsonwebtoken');

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

// token = 'eyJhbGciOiJSUzI1NiJ9.eyJjbGllbnRJZCI6IjVjMGU3NTBiN2E1Y2Q0MjQ2NGE1MDk5ZCIsInVzZXJfaWQiOiI1ZDA3MzlhZjkwMWNkOWRhMGMyYzM0NjMiLCJjcmVhdGVkQXQiOjE1NjE3OTcyMTQ4NTEsInJvbGVzIjpbIjVkMDczOWFmOTAxY2Q5ZGEwYzJjMzQ2MyIsIjViOWEwYTM4M2ZjYmEwMjY0OTUyNGJmMSJdLCJleHBpcmVkYXRlIjoxNTYxNzk5MDE0ODUxfQ.SyOQLxfkl0YZOCUql1U3aixLjaabhenTuu-FCRvptyI2okYtia9Du9p5PpzW7MFPb2inz1aHYkXrt_X6uEUFeSlodgEW2ZBF60RkYeISZEsjEb92zJkkLkx5TyjoTnDWRFkXekIIVG6nPNO4Pp10D2bl0gpmfr2OSDM4hljVNBo7Q8qYBZpJN5ik-UZtJx3jaOE-QgfJcDhp_NNJfa2ngfe9OtXGAIu_75-wGCFIqB62LHAlPRxowDxNmf5xkgK8FSAa76IHtKmb8T6n3DFAMaI_yS5gTZf1Z__wBtkeU3qFuEIT4R3g0Sq5o6OqziAYw6h-SGhZCNp-vxEm8nuwQA';
let token = 'eyJhbGciOiJSUzI1NiJ9.eyJjbGllbnRJZCI6IjVjMGU3NTBiN2E1Y2Q0MjQ2NGE1MDk5ZCIsImNyZWF0ZWRBdCI6MTU2MzUyNDMyODI2Mywicm9sZXMiOlsiYWRtaW4iLCIkZXZlcnlvbmUiLCLmlbDmja7kuK3lv4MiXSwiZXhwaXJlZGF0ZSI6MTU2MzUyNjEyODI2M30.sK7NIoIN_A2BVqEtt7Awh1rsN4HmaAUBSOp2KHQZgwoX0odtD5bqFOFR6Lle6B8XNiSVwN8Z4VCYVz-7VG_J5Jn94uhLByBXUx03STK_JgbbmRkn4B_d2mKtQ3ESI0KO2-SlXWhaHGwybYgkAyWT5L4mcaMx51ZBbfzgrppmGv6EHZ5r7sKwnPv3vZoTPPkbP30VxRBYkKQF2txPZsuxEJIFUdt0G4oPd3XQsbcr0QQdTlmra9b_DRJTDkpAIBBWDw_DBHkYkZBOPdDbqA_NKiyBwma_7326EUUIznl2hwYhdDG-48M0vRXDQ781BquTtlEfJx-u85FRX-7cdYIQCA';
let payload = jwt.verify(token, publicKey, {algorithm: 'RS256'});

console.log(payload);

verify(payload, function(err, user, message){
	console.log("err:", err);
	console.log("user:", user);
	console.log("message:", message);
});

function verify( payload, cb ) {

	// @ts-ignore
	const apiRoles = ['admin'];

	payload = payload || {};

	const name = payload['name'],
		expireDateTime = name === 'Guest user' ? new Date().getTime() + 60000: payload['expiredate'],
		roles = payload['roles'],
		user_id = payload['clientId'],
		email = payload['email']
	;

	console.log(`auth user ${user_id}, payload is ${JSON.stringify(payload)}, api roles is ${JSON.stringify(apiRoles)}`);

	if( !expireDateTime || !roles || roles.length === 0 || !user_id ){
		cb(null, false, 'invalid token');
		return;
	}
	// 验证过期时间
	/*if( expireDateTime < new Date().getTime() ){
		cb(null, false, 'token expired');
		return;
	}*/

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
