const fs = require('fs');
const Browser = require('zombie');
const cheerio = require('cheerio');
const minify = require('html-minifier').minify;
exports.Elternportal_Interface = {
	base_url: undefined,
	init: () => {
		if (!fs.existsSync('./parsed')) {
			fs.mkdirSync('./parsed');
		}
		if (!fs.existsSync('./raw')) {
			fs.mkdirSync('./raw');
		}
	},
	spawn_zombie: (url, logindata, callback, kid = undefined) => {
		Browser.visit(this.Elternportal_Interface.base_url + url, (error, browser) => {
			browser.fill('#inputEmail', logindata.username);
			browser.fill('#inputPassword', logindata.password);
			browser.document.forms[0].submit();
			browser.wait(() => {
				// user is now logged in and on /start
				// tricky move: go back to the previous page (url), as you are now logged in
				browser.back(() => {
					// login page is still shown, reload to get the login corrected
					browser.reload(() => {
						// TODO: switch ChildID: this.Elternportal_Interface.base_url + origin/set_child.php?id=1373
						if (kid != undefined) {
						}
						// this is the page we want
						callback(browser.html());
					});
				});
			});
		});
	}
};
exports.Parsing_Interface = {
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
		get_kids: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let kids = [];
			cheerio2('.pupil-selector .form-group .form-control').each((i, elem) => {
				kids.push({ name: cheerio2(elem).text(), id: cheerio2(elem).val() });
			});
			callback({ kids: kids });
		},
		stundenplan: (html, callback = () => {}) => {
			rendered_table = this.Parsing_Interface.parsers.base(html);
			rendered_table = rendered_table.replace(/ align="center" valign="middle"/g, '');
			rendered_table = rendered_table.replace(/ align="center"/g, '');
			rendered_table = rendered_table.replace(/ width="15%"/g, '');
			rendered_table = rendered_table.replace(/ width="17%"/g, '');
			let cheerio2 = cheerio.load(html);
			let table_title = cheerio2('.table_header').html();
			table_title = table_title.replace(/<tbody><tr><td><h2>/g, '');
			table_title = table_title.replace(/<\/h2><\/td><\/tr><\/tbody>/g, '');
			table_title = table_title.replace(/<img.*?src="(.*?)"[^\>]+>/g, '');
			table_title = table_title.replace(/<span(?:.+)<\/span>/g, '');
			let planArray = [];
			let counter = 0;
			cheerio2('#asam_content > div > table > tbody > tr').each((i, elem) => {
				if (counter != 0) {
					let current_brief = {};
					current_brief.stunde = {
						count: cheerio2(elem).children().eq(0).html().split('<br>')[0],
						description: cheerio2(elem).children().eq(0).html().split('<br>')[1]
					};
					current_brief.montag = {
						fach: cheerio2(elem).children().eq(1).html().split('<br>')[0],
						raum: cheerio2(elem).children().eq(1).html().split('<br>')[1]
					};
					current_brief.dienstag = {
						fach: cheerio2(elem).children().eq(2).html().split('<br>')[0],
						raum: cheerio2(elem).children().eq(2).html().split('<br>')[1]
					};
					current_brief.mittwoch = {
						fach: cheerio2(elem).children().eq(3).html().split('<br>')[0],
						raum: cheerio2(elem).children().eq(3).html().split('<br>')[1]
					};
					current_brief.donnerstag = {
						fach: cheerio2(elem).children().eq(4).html().split('<br>')[0],
						raum: cheerio2(elem).children().eq(4).html().split('<br>')[1]
					};
					current_brief.freitag = {
						fach: cheerio2(elem).children().eq(5).html().split('<br>')[0],
						raum: cheerio2(elem).children().eq(5).html().split('<br>')[1]
					};
					planArray.push(current_brief);
				}
				counter++;
			});
			planArray.forEach((elem) => {
				elem.montag.fach = elem.montag.fach.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.montag.raum = elem.montag.raum.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.dienstag.fach = elem.dienstag.fach.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.dienstag.raum = elem.dienstag.raum.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.mittwoch.fach = elem.mittwoch.fach.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.mittwoch.raum = elem.mittwoch.raum.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.donnerstag.fach = elem.donnerstag.fach.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.donnerstag.raum = elem.donnerstag.raum.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.freitag.fach = elem.freitag.fach.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
				elem.freitag.raum = elem.freitag.raum.replace(/<span class>/g, '').replace(/ <\/span>/g, '');
			});
			callback({
				stundenplan: {
					title: table_title,
					json: {
						titles: [ '', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag' ],
						rows: planArray
					},
					rendered_table: rendered_table
				}
			});
		},
		elternbriefe: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let elternbriefe = [];
			let processed_ids = [];
			cheerio2('#asam_content > table.table2.more_padding > tbody > tr > [valign="top"]').each((i, elem) => {
				let parent = cheerio2(elem).parent();
				let current_brief = {};
				if (parent.children().eq(0).text().includes('#')) {
					current_brief.id = parent.children().eq(0).text().replace('#', '');
					if (!processed_ids.includes(current_brief.id)) {
						let cheerio3 = cheerio.load(parent.children().eq(1).children().eq(0).html());
						current_brief.title = cheerio3('h4').text();
						cheerio3('h4').remove();
						current_brief.date = cheerio3.text();
						//
						let cheerio4 = cheerio.load(parent.children().eq(1).html());
						cheerio4('a').remove();
						current_brief.content = cheerio4('body').html();
						elternbriefe.push(current_brief);
						processed_ids.push(current_brief.id);
					}
				}
			});
			callback({ elternbriefe: elternbriefe });
		},
		wer_macht_was: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let wer_macht_was = [];
			cheerio2('#asam_content > div.row > div > div.thumbnail > div.caption').each((i, elem) => {
				let current_wmw = {
					title: cheerio2(elem).children().eq(0).html().replace(/ <small(?:.+)<\/small>/g, ''),
					description: cheerio2(elem).find('small').text(),
					people: []
				};
				for (let index = 0; index < cheerio2(elem).children().eq(1).children().length; index++) {
					current_wmw.people.push(cheerio2(elem).children().eq(1).children().eq(index).text());
				}
				wer_macht_was.push(current_wmw);
			});
			callback({ wer_macht_was: wer_macht_was });
		},
		schulaufgaben_plan: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let schulaufgaben = [];
			cheerio2('#asam_content > div:nth-child(3) > div > table > tbody > tr > [valign="top"]').each((i, elem) => {
				let parent = cheerio2(elem).parent();
				let current_schulaufgabe = {};
				current_schulaufgabe.date = parent.children().eq(0).text();
				current_schulaufgabe.time = parent.children().eq(1).text();
				current_schulaufgabe.title = parent.children().eq(2).text();
				schulaufgaben.push(current_schulaufgabe);
			});
			callback({ schulaufgaben: schulaufgaben });
		},
		allgemeine_termine: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let allgemeine_termine = [];
			cheerio2('#asam_content > div:nth-child(3) > div > table > tbody > tr > [valign="top"]').each((i, elem) => {
				let parent = cheerio2(elem).parent();
				let termin = {};
				termin.date = parent.children().eq(0).text();
				termin.time = parent.children().eq(1).text();
				termin.title = parent.children().eq(2).text();
				allgemeine_termine.push(termin);
			});
			callback({ allgemeine_termine: allgemeine_termine });
		},
		schulinformationen: (html, callback = () => {}) => {
			let cheerio_2 = cheerio.load(html);
			parsed = cheerio_2('#asam_content').html();
			callback({ rendered: parsed, title: 'Schulinformationen' });
		},
		schwarzesbrett: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let letters = [];
			cheerio2('#asam_content > div:nth-child(3) > div > div > div.grid-item > div').each((i, elem) => {
				letters.push({
					date: cheerio2(elem).children().eq(0).html(),
					title: cheerio2(elem).children().eq(1).html(),
					content: cheerio2(elem).children().eq(2).html()
				});
			});
			cheerio2('#asam_content > div.arch > div > div').each((i, elem) => {
				let title = cheerio2(elem).children().eq(0).children().eq(1).text();
				let date = cheerio2(elem).children().eq(0).children().eq(0).text();
				let content = cheerio2(elem).children().eq(1).children().eq(1).text();
				let content_html = cheerio2(elem).children().eq(1).children().eq(1).html();
				letters.push({
					title: title,
					date: date,
					content: content,
					content_html: content_html
				});
			});
			callback({ letters: letters });
		},
		fundsachen: (html, callback = () => {}) => {
			html = minify(html, this.Parsing_Interface.minify_options);
			let cheerio2 = cheerio.load(html);
			let fundsachen = [];
			cheerio2('#asam_content > div:nth-child(3) > div > div > div > p').each((i, elem) => {
				fundsachen.push({ name: cheerio2(elem).text() });
			});
			callback({ fundsachen: fundsachen });
		},
		base: (html) => {
			console.log('parsing...');
			let $ = cheerio.load(html);
			parsed = $('#asam_content').html();
			parsed = minify(parsed, this.Parsing_Interface.minify_options);
			return parsed;
		}
	}
};
exports.writeFile = (file, content) => {
	fs.writeFile(file, content, (err) => {
		if (err) {
			return console.log(err);
		}
		console.log(`The file '${file} was saved!`);
	});
};
