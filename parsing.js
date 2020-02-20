const fs = require('fs');
const cheerio = require('cheerio');
let minify = require('html-minifier').minify;

fs.readFile('elternbriefe.raw.html', (err, data) => {
	if (err) return console.error(err);
	let parsed = GymH_Elternportal_Parsing_Interface.parsers.elternbriefe(data.toString());
	log_it(parsed, 'elternbriefe.parsed.html');
});

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
		stundenplan: (html) => {
			console.log('parsing stundenplan...');
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
			return parsed;
		},
		elternbriefe: (html) => {
			console.log('parsing stundenplan...');
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
			return parsed;
		}
	}
};

let log_it = (data, file) => {
	fs.writeFile(file, data, (err) => {
		if (err) {
			return console.log(err);
		}
	});
};
