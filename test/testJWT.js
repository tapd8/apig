
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

token = 'eyJhbGciOiJSUzI1NiJ9.eyJjbGllbnRJZCI6IjVjMGU3NTBiN2E1Y2Q0MjQ2NGE1MDk5ZCIsInVzZXJfaWQiOiI1ZDA3MzlhZjkwMWNkOWRhMGMyYzM0NjMiLCJjcmVhdGVkQXQiOjE1NjE3OTcyMTQ4NTEsInJvbGVzIjpbIjVkMDczOWFmOTAxY2Q5ZGEwYzJjMzQ2MyIsIjViOWEwYTM4M2ZjYmEwMjY0OTUyNGJmMSJdLCJleHBpcmVkYXRlIjoxNTYxNzk5MDE0ODUxfQ.SyOQLxfkl0YZOCUql1U3aixLjaabhenTuu-FCRvptyI2okYtia9Du9p5PpzW7MFPb2inz1aHYkXrt_X6uEUFeSlodgEW2ZBF60RkYeISZEsjEb92zJkkLkx5TyjoTnDWRFkXekIIVG6nPNO4Pp10D2bl0gpmfr2OSDM4hljVNBo7Q8qYBZpJN5ik-UZtJx3jaOE-QgfJcDhp_NNJfa2ngfe9OtXGAIu_75-wGCFIqB62LHAlPRxowDxNmf5xkgK8FSAa76IHtKmb8T6n3DFAMaI_yS5gTZf1Z__wBtkeU3qFuEIT4R3g0Sq5o6OqziAYw6h-SGhZCNp-vxEm8nuwQA';
let start = new Date().getTime();
let data = jwt.verify(token, publicKey, {algorithm: 'RS256'});
let end = new Date().getTime();

console.log(data);

console.log( (end - start) / 1000 + ' s');
