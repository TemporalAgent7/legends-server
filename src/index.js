const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

let nocache = (req, res, next) => {
	res.setHeader('Surrogate-Control', 'no-store');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');

	next();
};

let corsOptions = {
	origin: true, //['https://legends.datacore.app', 'http://localhost:3000'],
	optionsSuccessStatus: 200 // some legacy browsers choke on 204
};

app.use(cors(corsOptions), nocache);

app.use(express.json({ limit: '1mb' }));

app.get('/get_profile', (req, res) => {
	if (!req.query || !req.query.id) {
		res.status(400).send('Whaat?');
		return;
	}

	if (!fs.existsSync(`${process.env.DATA_PATH}${req.query.id}.json`)) {
		res.status(400).send('Not found');
		return;
	}

	res.download(`${process.env.DATA_PATH}${req.query.id}.json`);
});

app.post('/post_profile', (req, res, next) => {
	if (!req.body || !req.body.cloudSaveId) {
		res.status(400).send('Whaat?');
		return;
	}

	try {
		fs.writeFileSync(`${process.env.DATA_PATH}${req.body.cloudSaveId}.json`, JSON.stringify(req.body));
		res.status(200).send(req.body.cloudSaveId);
	} catch (e) {
		next(e);
	}
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(
	{
		key: fs.readFileSync(process.env.CERT_PATH + '/privkey.pem'),
		cert: fs.readFileSync(process.env.CERT_PATH + '/cert.pem')
	},
	app
);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
