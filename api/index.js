const gymh_server_functions = require('./server-functions');
// Zeit Now
// lambda
module.exports = (req, res) => {
	gymh_server_functions.set_params(req, (cb) => {
		gymh_server_functions.navigate(req, res, cb);
	});
};
