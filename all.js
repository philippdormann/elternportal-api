const fs = require('fs');
const gymh = require('./api/gh-elternportal');
// APP usage
gymh.Elternportal_Interface.base_url = 'https://heraugy.eltern-portal.org/';
const logindata = JSON.parse(fs.readFileSync('login-data.json', 'utf8'));
gymh.Elternportal_Interface.init();

// --service/stundenplan
gymh.Elternportal_Interface.spawn_zombie('service/stundenplan', logindata, (html) => {
	gymh.writeFile('raw/stundenplan.raw.html', html);
	gymh.Parsing_Interface.parsers.stundenplan(html, (parsed) => {
		gymh.writeFile('parsed/stundenplan.parsed.json', JSON.stringify(parsed));
	});
});
// // --aktuelles/elternbriefe
// gymh.Elternportal_Interface.spawn_zombie('aktuelles/elternbriefe', logindata, (html) => {
// 	gymh.writeFile('raw/elternbriefe.raw.html', html);
// 	gymh.Parsing_Interface.parsers.elternbriefe(html, (parsed) => {
// 		gymh.writeFile('parsed/elternbriefe.parsed.json', JSON.stringify(parsed));
// 	});
// });
// // --service/wer_macht_was
// gymh.Elternportal_Interface.spawn_zombie('service/wer_macht_was', logindata, (html) => {
// 	gymh.writeFile('raw/wer_macht_was.raw.html', html);
// 	gymh.Parsing_Interface.parsers.wer_macht_was(html, (parsed) => {
// 		gymh.writeFile('parsed/wer_macht_was.parsed.json', JSON.stringify(parsed));
// 	});
// });
// --service/termine/liste/schulaufgaben
// gymh.Elternportal_Interface.spawn_zombie('service/termine/liste/schulaufgaben', logindata, (html) => {
// 	gymh.writeFile('raw/schulaufgaben_plan.raw.html', html);
// 	gymh.Parsing_Interface.parsers.schulaufgaben_plan(html, (parsed) => {
// 		gymh.writeFile('parsed/schulaufgaben_plan.parsed.json', JSON.stringify(parsed));
// 	});
// });
// // --service/termine/liste/allgemein
// gymh.Elternportal_Interface.spawn_zombie('service/termine/liste/allgemein', logindata, (html) => {
// 	gymh.writeFile('raw/allgemeine_termine.raw.html', html);
// 	gymh.Parsing_Interface.parsers.allgemeine_termine(html, (parsed) => {
// 		gymh.writeFile('parsed/allgemeine_termine.parsed.json', JSON.stringify(parsed));
// 	});
// });
// // --service/schulinformationen
// gymh.Elternportal_Interface.spawn_zombie('service/schulinformationen', logindata, (html) => {
// 	gymh.writeFile('raw/schulinformationen.raw.html', html);
// 	gymh.Parsing_Interface.parsers.schulinformationen(html, (parsed) => {
// 		gymh.writeFile('parsed/schulinformationen.parsed.json', JSON.stringify(parsed));
// 	});
// });
// // --aktuelles/schwarzes_brett
// gymh.Elternportal_Interface.spawn_zombie('aktuelles/schwarzes_brett', logindata, (html) => {
// 	gymh.writeFile('raw/schwarzesbrett.raw.html', html);
// 	// gymh.Parsing_Interface.parsers.schwarzesbrett(html, (parsed) => {
// 	// 	gymh.writeFile('parsed/schwarzesbrett.parsed.json', JSON.stringify(parsed));
// 	// });
// });
// // --suche/fundsachen
// gymh.Elternportal_Interface.spawn_zombie('suche/fundsachen', logindata, (html) => {
// 	gymh.writeFile('raw/fundsachen.raw.html', html);
// 	gymh.Parsing_Interface.parsers.fundsachen(html, (parsed) => {
// 		gymh.writeFile('parsed/fundsachen.parsed.json', JSON.stringify(parsed));
// 	});
// });
// // --get_kids
// gymh.Elternportal_Interface.spawn_zombie('start', logindata, (html) => {
// 	gymh.writeFile('raw/kids.raw.html', html);
// 	gymh.Parsing_Interface.parsers.get_kids(html, (parsed) => {
// 		gymh.writeFile('parsed/kids.parsed.json', JSON.stringify(parsed));
// 	});
// });
