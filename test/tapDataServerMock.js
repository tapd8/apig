const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('tap data server mock.'));

app.post('/api/Workers', (req, res) => {
	console.log(req.body);
	res.json({success: true});
});
app.listen(3030, () => console.log(`tap data server listen on port 3030!`));