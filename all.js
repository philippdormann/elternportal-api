const gymh = require('./gh-elternportal');
// APP usage
gymh.Elternportal_Interface.base_url = 'https://heraugy.eltern-portal.org/';
gymh.Elternportal_Interface.init();
// --service/stundenplan
gymh.Elternportal_Interface.spawn_zombie('service/stundenplan', (html) => {
	gymh.writeFile('raw/stundenplan.raw.html', html);
	gymh.Parsing_Interface.parsers.stundenplan(html, (parsed) => {
		gymh.writeFile('parsed/stundenplan.parsed.json', JSON.stringify(parsed));
	});
});
// --aktuelles/elternbriefe
gymh.Elternportal_Interface.spawn_zombie('aktuelles/elternbriefe', (html) => {
	gymh.writeFile('raw/elternbriefe.raw.html', html);
	gymh.Parsing_Interface.parsers.elternbriefe(html, (parsed) => {
		gymh.writeFile('parsed/elternbriefe.parsed.json', JSON.stringify(parsed));
	});
});
// --service/wer_macht_was
gymh.Elternportal_Interface.spawn_zombie('service/wer_macht_was', (html) => {
	gymh.writeFile('raw/wer_macht_was.raw.html', html);
	gymh.Parsing_Interface.parsers.wer_macht_was(html, (parsed) => {
		gymh.writeFile('parsed/wer_macht_was.parsed.json', JSON.stringify(parsed));
	});
});
