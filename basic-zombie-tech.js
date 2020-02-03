const fs = require('fs');
const Browser = require('zombie');
const GymH_Login_Data = JSON.parse(fs.readFileSync('login-data.json', 'utf8'));

Browser.visit('https://heraugy.eltern-portal.org/service/stundenplan', function(error, browser) {
	browser.fill('#inputEmail', GymH_Login_Data.username);
	browser.fill('#inputPassword', GymH_Login_Data.password);
	browser.document.forms[0].submit();

	browser.wait(() => {
		const value = browser.getCookie('PHPSESSID');
		console.log('Cookie', value);
		// user is now logged in and on /start
		// tricky move: go back to the previous page (/service/stundenplan), as you are now logged in

		browser.back(() => {
			browser.reload(() => {
				fs.writeFile('zombie.html', browser.html(), function(err) {
					if (err) {
						return console.log(err);
					}
					console.log('The file was saved!');
				});
			});
		});
	});
});
