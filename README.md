# @gymh/elternportal-api
🔌 unofficial APIs for connecting to `*.eltern-portal.org` URLs/ infoportal by art soft and more GmbH

## API usage
- `https://elternportal-api.vercel.app/?school=<shortcode>&username=<username>&password=<password>&action=<action>`
- `shortcode`: short code of school institute (url encode when needed)
- `username`: Elternportal email (url encoded)
- `password`: Elternportal password (url encoded)
- `action`: one of
  - `check_auth`
  - `kids`
  - `stundenplan`
  - `elternbriefe`
  - `wer_macht_was`
  - `schulaufgaben_plan`
  - `allgemeine_termine`
  - `schulinformationen`
  - `schwarzesbrett`
  - `fundsachen`
  
## 👉 Sample API calls
### get your kids
- https://elternportal-api.vercel.app/?school=*{shortcode}*&username=*{username}*&password=*{password}*&action=kids
### stundenplan of kid #{ID}
- https://elternportal-api.vercel.app/?school=*{shortcode}*&username=*{username}*&password=*{password}*&action=stundenplan&kid=*{ID}*

## 💬 API responses
### ❌ errors
```
{ "status": "fail", "code": "no_kid_supplied" }
```
```
{ "status": "fail", "code": "no_school_supplied" }
```
```
{ "status": "fail", "code": "unknown_action" }
```
```
{ "status": "fail", "code": "unknown_error" }
```
### 🔒 auth checks: action=check_auth
```
{ "status": "ok", "payload": "auth_valid" }
```
```
{ "status": "ok", "payload": "auth_invalid" }
```
### ✅ successful actions
- action=kids
```
{
  "status": "ok",
  "payload": {
    "kids": [
      {
        "name": "<VORNAME> <NACHNAME> (<KLASSE>)",
        "id": "<ID>"
      }
    ]
  }
}
```
-  action=stundenplan
```
{
	"status": "ok",
	"payload": {
		"stundenplan": {
			"title": "Stundenplan der Klasse <KLASSE>",
			"json": {
				"titles": [ "", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag" ],
				"rows": [
					{
						"stunde": { "count": "1", "description": "08.00 - 08.45" },
						"montag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"dienstag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"mittwoch": { "fach": "<FACH>", "raum": "<RAUM>" },
						"donnerstag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"freitag": { "fach": "<FACH>", "raum": "<RAUM>" }
					},
					{
						"stunde": { "count": "2", "description": "08.45 - 09.30" },
						"montag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"dienstag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"mittwoch": { "fach": "<FACH>", "raum": "<RAUM>" },
						"donnerstag": { "fach": "<FACH>", "raum": "<RAUM>" },
						"freitag": { "fach": "<FACH>", "raum": "<RAUM>" }
					}
				]
			},
			"rendered_table": "<RENDERED_TABLE>"
		}
	}
}
```
-  action=elternbriefe
```
{
  "status": "ok",
  "payload": {
    "elternbriefe": [
      {
        "id": "<ID>",
        "title": "<TITLE>",
        "date": "<SENT-DATE>",
        "content": "<HTML-CONTENT>"
      },
      {
        "id": "<ID>",
        "title": "<TITLE>",
        "date": "<SENT-DATE>",
        "content": "<HTML-CONTENT>"
      }
    ]
  }
}
```
-  action=wer_macht_was
```
{
  "status": "ok",
  "payload": {
    "wer_macht_was": [
      {
        "title": "<TITLE>",
        "description": "<DESCRIPTION>",
        "people": [
          "Max Mustermann"
        ]
      },
      {
        "title": "<TITLE>",
        "description": "<DESCRIPTION>",
        "people": [
          "Max Mustermann",
          "Erika Mustermann"
        ]
      }
    ]
  }
}
```
-  action=schulaufgaben_plan
```
{
  "status": "ok",
  "payload": {
    "schulaufgaben": [
      {
        "date": "<DATE>",
        "time": " ",
        "title": "<TITEL DER ARBEIT> (<LEHRER-SHORT>)"
      },
      {
        "date": "<DATE>",
        "time": " ",
        "title": "<TITEL DER ARBEIT> (<LEHRER-SHORT>)"
      }
    ]
  }
}
```
-  action=allgemeine_termine
```
{
  "status": "ok",
  "payload": {
    "allgemeine_termine": [
      {
        "date": "DD.MM.YYYY - DD.MM.YYYY",
        "time": "HH:ii - HH:ii",
        "title": "<TITLE>"
      },
      {
        "date": "DD.MM.YYYY - DD.MM.YYYY",
        "time": "HH:ii - HH:ii",
        "title": "<TITLE>"
      }
    ]
  }
}
```
-  action=schulinformationen
```
{
  "status": "ok",
  "payload": {
    "info_list": [
      {
        "key": "<KEY>",
        "value": "<VALUE>"
      },
      {
        "key": "<KEY>",
        "value": "<VALUE>"
      }
    ],
    "lehrer_list": [
      {
        "key": "<LEHRER-SHORT>",
        "value": "<LEHRER-LONG>"
      },
      {
        "key": "<LEHRER-SHORT>",
        "value": "<LEHRER-LONG>"
      }
    ]
  }
}
```
-  action=schwarzesbrett
```
{
  "status": "ok",
  "payload": {
    "letters": [
      {
        "title": "<TITLE>",
        "date": "<DATE>",
        "content": "<CONTENT>",
        "content_html": "<HTML-CONTENT>"
      },
      {
        "title": "<TITLE>",
        "date": "<DATE>",
        "content": "<CONTENT>",
        "content_html": "<HTML-CONTENT>"
      }
    ]
  }
}
```
-  action=fundsachen
```
{
  "status": "ok",
  "payload": {
    "fundsachen": [
      {
        "name": "<ITEM-NAME>"
      },
      {
        "name": "<ITEM-NAME>"
      }
    ]
  }
}
```

## 🚀 Deployment
- this app is deployed as a serverless function on the url <https://elternportal-api.vercel.app> with [Vercel](https://vercel.com/) ☁️
- the code to this function can be found in the `/api` folder 📁

## ❓ Behind the scenes
- `server.js`
  - STEP 01: start ExpressJS Server listening on port 3000
  - STEP 02: parse url parameters
  - STEP 03: get data from server
    - navigate to the target url (e.g. `/service/stundenplan`) with Zombie.js
    - fill out login form + submit
    - > at this point, the user is successfully logged in
    - go 1 back in browser history, so we are at the target url again
    - refresh the page so the browser updates the login state
  - STEP 04: parse the data: Regex
  - STEP 05: output to JSON

## 🔨 Development
- rename `login-data.example.json` to `login-data.json`
- edit `login-data.json` to your login data
- `yarn`
- `yarn dev`
