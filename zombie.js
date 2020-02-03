const fs = require('fs');
const Browser = require('zombie');
const cheerio = require('cheerio');
let minify = require('html-minifier').minify;
const GymH_Login_Data = JSON.parse(fs.readFileSync('login-data.json', 'utf8'));

let GymH_Elternportal_Interface = {
	base_url: undefined,
	init: () => {
		if (!fs.existsSync('./parsed')) {
			fs.mkdirSync('./parsed');
		}
		if (!fs.existsSync('./raw')) {
			fs.mkdirSync('./raw');
		}
	},
	spawn_zombie: (url, callback) => {
		Browser.visit(GymH_Elternportal_Interface.base_url + url, function(error, browser) {
			browser.fill('#inputEmail', GymH_Login_Data.username);
			browser.fill('#inputPassword', GymH_Login_Data.password);
			browser.document.forms[0].submit();
			browser.wait(() => {
				// user is now logged in and on /start
				// tricky move: go back to the previous page (url), as you are now logged in
				browser.back(() => {
					// login page is still shown, reload to get the login corrected
					browser.reload(() => {
						// this is the page we want
						callback(browser.html());
					});
				});
			});
		});
	}
};
let GymH_Elternportal_Parsing_Interface = {
	minify_options: {
		useShortDoctype: true,
		minifyCSS: true,
		minifyJS: true,
		html5: true,
		collapseWhitespace: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeScriptTypeAttributes: true
	},
	parsers: {
		stundenplan: (html, callback = () => {}) => {
			console.log('parsing...');
			let $ = cheerio.load(html);
			$('.hidden-xs').remove();
			parsed = $('#asam_content').html();
			parsed = minify(parsed, GymH_Elternportal_Parsing_Interface.minify_options);
			parsed = parsed.replace(/<!--[\s\S]*?-->/g, ''); //remove comments
			parsed = parsed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); //remove scripts
			parsed = parsed.replace(/<img.*?src="(.*?)"[^\>]+>/g, ''); //remove img tags
			parsed = parsed.replace(/ align="center" valign="middle"/g, '');
			parsed = parsed.replace(/ align="center"/g, '');
			parsed = parsed.replace(/ width="15%"/g, '');
			parsed = parsed.replace(/ width="17%"/g, '');
			parsed = parsed.replace(/ width="100%" border="0"/g, '');
			let cheerio_2 = cheerio.load(parsed);
			let table_title = cheerio_2('.table_header').html();
			table_title = table_title.replace(/<tbody><tr><td><h2>/g, '');
			table_title = table_title.replace(/<\/h2><\/td><\/tr><\/tbody>/g, '');
			callback({ rendered: parsed, title: table_title });
		},
		elternbriefe: (html, callback = () => {}) => {
			console.log('parsing...');
			let $ = cheerio.load(html);
			$('.hidden-xs').remove();
			parsed = $('#asam_content').html();
			parsed = minify(parsed, GymH_Elternportal_Parsing_Interface.minify_options);
			parsed = parsed.replace(/<!--[\s\S]*?-->/g, ''); //remove comments
			parsed = parsed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); //remove scripts
			parsed = parsed.replace(/<img.*?src="(.*?)"[^\>]+>/g, ''); //remove img tags
			parsed = parsed.replace(/ align="center" valign="middle"/g, '');
			parsed = parsed.replace(/ align="center"/g, '');
			parsed = parsed.replace(/ width="15%"/g, '');
			parsed = parsed.replace(/ width="17%"/g, '');
			parsed = parsed.replace(/ width="100%" border="0"/g, '');
			callback({ rendered: parsed, title: 'Elternbriefe' });
		},
		wer_macht_was: (html, callback = () => {}) => {
			console.log('parsing...');
			let $ = cheerio.load(html);
			$('.hidden-xs').remove();
			parsed = $('#asam_content').html();
			parsed = minify(parsed, GymH_Elternportal_Parsing_Interface.minify_options);
			parsed = parsed.replace(/<!--[\s\S]*?-->/g, ''); //remove comments
			parsed = parsed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); //remove scripts
			parsed = parsed.replace(/<img.*?src="(.*?)"[^\>]+>/g, ''); //remove img tags
			parsed = parsed.replace(/ align="center" valign="middle"/g, '');
			parsed = parsed.replace(/ align="center"/g, '');
			parsed = parsed.replace(/ width="15%"/g, '');
			parsed = parsed.replace(/ width="17%"/g, '');
			parsed = parsed.replace(/ width="100%" border="0"/g, '');
			callback({ rendered: parsed, title: 'Wer macht Was' });
		}
	}
};
let writeFile = (file, content) => {
	fs.writeFile(file, content, function(err) {
		if (err) {
			return console.log(err);
		}
		console.log(`The file '${file} was saved!`);
	});
};
// APP usage
GymH_Elternportal_Interface.base_url = 'https://heraugy.eltern-portal.org/';
GymH_Elternportal_Interface.init();
// --service/stundenplan
GymH_Elternportal_Interface.spawn_zombie('service/stundenplan', (html) => {
	writeFile('raw/stundenplan.raw.html', html);
	GymH_Elternportal_Parsing_Interface.parsers.stundenplan(html, (parsed) => {
		writeFile('parsed/stundenplan.parsed.json', JSON.stringify(parsed));
	});
});
// --aktuelles/elternbriefe
GymH_Elternportal_Interface.spawn_zombie('aktuelles/elternbriefe', (html) => {
	writeFile('raw/elternbriefe.raw.html', html);
	GymH_Elternportal_Parsing_Interface.parsers.elternbriefe(html, (parsed) => {
		writeFile('parsed/elternbriefe.parsed.json', JSON.stringify(parsed));
	});
});
// --service/wer_macht_was
GymH_Elternportal_Interface.spawn_zombie('service/wer_macht_was', (html) => {
	writeFile('raw/wer_macht_was.raw.html', html);
	GymH_Elternportal_Parsing_Interface.parsers.wer_macht_was(html, (parsed) => {
		writeFile('parsed/wer_macht_was.parsed.json', JSON.stringify(parsed));
	});
});
