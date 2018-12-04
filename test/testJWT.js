
const jwt = require('jsonwebtoken');

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

let token = jwt.sign({
	roles: ["id1", "id2", "id3", "id4"],
	expiredate: new Date().getTime()
}, key);

console.log( token );

let data = jwt.verify(token, key);

console.log(data);

try {
	jwt.verify(token, key+'1');
} catch (e) {
	console.error('验证失败');
}

let decoded = jwt.decode(token, {complete: true});

console.log(decoded);
