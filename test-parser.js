const fs = require('fs');
const gymh = require('./api/gh-elternportal');
let test_parse = (raw_file, action = () => {}) => {
	fs.readFile(raw_file, { encoding: 'utf-8' }, function(err, data) {
		if (!err) {
			action(data);
		} else {
			console.log(err);
		}
	});
};

// APP usage
// // --service/stundenplan
// gymh.Elternportal_Interface.spawn_zombie('service/stundenplan', logindata, (html) => {
// 	gymh.writeFile('raw/stundenplan.raw.html', html);
// 	gymh.Parsing_Interface.parsers.stundenplan(html, (parsed) => {
// 		gymh.writeFile('parsed/stundenplan.parsed.json', JSON.stringify(parsed));
// 	});
// });
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
// test_parse('./raw/schwarzesbrett.raw.html', (data) => {
// 	gymh.Parsing_Interface.parsers.schwarzesbrett(data, (parsed) => {
// 		gymh.writeFile('parsed/schwarzesbrett.parsed.json', JSON.stringify(parsed));
// 	});
// });
// test_parse('./raw/allgemeine_termine.raw.html', (data) => {
// 	gymh.Parsing_Interface.parsers.allgemeine_termine(data, (parsed) => {
// 		gymh.writeFile('parsed/allgemeine_termine.parsed.json', JSON.stringify(parsed));
// 	});
// });
test_parse('./raw/stundenplan.raw.html', (data) => {
	gymh.Parsing_Interface.parsers.stundenplan(data, (parsed) => {
		gymh.writeFile('parsed/stundenplan.parsed.json', JSON.stringify(parsed));
	});
});
// test_parse('./raw/elternbriefe.raw.html', (data) => {
// 	gymh.Parsing_Interface.parsers.elternbriefe(data, (parsed) => {
// 		gymh.writeFile('parsed/elternbriefe.parsed.json', JSON.stringify(parsed));
// 	});
// });
// test_parse('./raw/schulaufgaben_plan.raw.html', (data) => {
// 	gymh.Parsing_Interface.parsers.schulaufgaben_plan(data, (parsed) => {
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
// 	gymh.Parsing_Interface.parsers.schwarzesbrett(html, (parsed) => {
// 		gymh.writeFile('parsed/schwarzesbrett.parsed.json', JSON.stringify(parsed));
// 	});
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
