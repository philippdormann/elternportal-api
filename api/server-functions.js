exports.gymh_ep = require('./gh-elternportal');
exports.login_data = {};
exports.navigate = (req, res, params) => {
	if (params.status == 'ok') {
		this.start_it_up(req, res, params.action);
	} else {
		this.send_json_response_success(req, res, { status: 'fail', code: 'unknown_error' });
	}
};
exports.set_params = (req, callback) => {
	this.login_data.username = decodeURI(req.query.username);
	this.login_data.password = decodeURI(req.query.password);
	let action = decodeURI(req.query.action);
	if (
		this.login_data.username != '' &&
		this.login_data.password != '' &&
		action != '' &&
		this.login_data.username != 'undefined' &&
		this.login_data.password != 'undefined' &&
		action != 'undefined' &&
		this.login_data.username != undefined &&
		this.login_data.password != undefined &&
		action != undefined
	) {
		callback({ status: 'ok', action: action });
	} else {
		callback('fail');
	}
};
exports.start_it_up = (req, res, action) => {
	if (
		decodeURI(req.query.school) == '' ||
		decodeURI(req.query.school) == undefined ||
		decodeURI(req.query.school) == 'undefined'
	) {
		this.send_json_response_error(req, res, 'no_school_supplied');
	} else {
		this.gymh_ep.Elternportal_Interface.base_url = `https://${req.query.school}.eltern-portal.org/`;
		if (action == 'kids' || action == 'add_kid') {
			if (action == 'kids') {
				this.gymh_ep.Elternportal_Interface.spawn_zombie('start', this.login_data, (html) => {
					this.gymh_ep.Parsing_Interface.parsers.get_kids(html, (parsed) => {
						this.send_json_response_success(req, res, parsed);
					});
				});
			}
			if (action == 'add_kid') {
				// TODO: implement add_kid
				this.send_json_response_success(req, res, 'kid_added');
			}
		} else {
			if (req.query.kid == undefined || req.query.kid == '') {
				this.send_json_response_error(req, res, 'no_kid_supplied');
			} else {
				if (action == 'stundenplan') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie('service/stundenplan', this.login_data, (html) => {
						this.gymh_ep.Parsing_Interface.parsers.stundenplan(html, (parsed) => {
							this.send_json_response_success(req, res, parsed);
						});
					});
				} else if (action == 'elternbriefe') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'aktuelles/elternbriefe',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.elternbriefe(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'wer_macht_was') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'service/wer_macht_was',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.wer_macht_was(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'schulaufgaben_plan') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'service/termine/liste/schulaufgaben',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.schulaufgaben_plan(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'allgemeine_termine') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'service/termine/liste/allgemein',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.allgemeine_termine(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'schulinformationen') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'service/schulinformationen',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.schulinformationen(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'schwarzesbrett') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie(
						'aktuelles/schwarzes_brett',
						this.login_data,
						(html) => {
							this.gymh_ep.Parsing_Interface.parsers.schwarzesbrett(html, (parsed) => {
								this.send_json_response_success(req, res, parsed);
							});
						}
					);
				} else if (action == 'fundsachen') {
					this.gymh_ep.Elternportal_Interface.spawn_zombie('suche/fundsachen', this.login_data, (html) => {
						this.gymh_ep.Parsing_Interface.parsers.fundsachen(html, (parsed) => {
							this.send_json_response_success(req, res, parsed);
						});
					});
				} else {
					this.send_json_response_error(req, res, 'unknown_action');
				}
			}
		}
	}
};
exports.send_json_response_error = (req, res, description) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify({ status: 'fail', code: description }));
};
exports.send_json_response_success = (req, res, content) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify({ status: 'ok', payload: content }));
};
