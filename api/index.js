const gymh = require('./gh-elternportal');

let login_data = {};
let navigate = (req, res, params) => {
	if (params.status == 'ok') {
		start_it_up(req, res, params.action);
	} else {
		send_json_response(req, res, { status: 'fail', rendered: '<h4>failed</h4>' });
	}
};
let set_params = (req, callback) => {
	login_data.username = decodeURI(req.query.username);
	login_data.password = decodeURI(req.query.password);
	let action = decodeURI(req.query.action);
	if (
		login_data.username != '' &&
		login_data.password != '' &&
		action != '' &&
		login_data.username != 'undefined' &&
		login_data.password != 'undefined' &&
		action != 'undefined' &&
		login_data.username != undefined &&
		login_data.password != undefined &&
		action != undefined
	) {
		callback({ status: 'ok', action: action });
	} else {
		callback('fail');
	}
};
let start_it_up = (req, res, action) => {
	gymh.Elternportal_Interface.base_url = 'https://heraugy.eltern-portal.org/';
	gymh.Elternportal_Interface.init();
	if (action == 'stundenplan') {
		gymh.Elternportal_Interface.spawn_zombie('service/stundenplan', login_data, (html) => {
			gymh.Parsing_Interface.parsers.stundenplan(html, (parsed) => {
				send_json_response(req, res, parsed);
			});
		});
	} else if (action == 'elternbriefe') {
		gymh.Elternportal_Interface.spawn_zombie('aktuelles/elternbriefe', login_data, (html) => {
			gymh.Parsing_Interface.parsers.elternbriefe(html, (parsed) => {
				send_json_response(req, res, parsed);
			});
		});
	} else if (action == 'wer_macht_was') {
		gymh.Elternportal_Interface.spawn_zombie('service/wer_macht_was', login_data, (html) => {
			gymh.Parsing_Interface.parsers.wer_macht_was(html, (parsed) => {
				send_json_response(req, res, parsed);
			});
		});
	}
};
let send_json_response = (req, res, content) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify(content));
};

module.exports = (req, res) => {
	set_params(req, (cb) => {
		navigate(req, res, cb);
	});
};
