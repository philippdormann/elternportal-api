const gymh_server_functions = require('./api/server-functions');
const express = require('express');
const app = express();
const server_port = 3000;

// ExpressJS
app.get('*', (req, res) => {
	gymh_server_functions.set_params(req, (status) => {
		gymh_server_functions.navigate(req, res, status);
	});
});
app.post('*', (req, res) => {
	gymh_server_functions.set_params(req, (status) => {
		gymh_server_functions.navigate(req, res, status);
	});
});
app.listen(server_port, () => {
	console.log(`listening on port ${server_port}!`);
});
