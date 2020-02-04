# gymh-elternportal-API
### scraper for <https://heraugy.eltern-portal.org> (or for that matter `*.eltern-portal.org`)
<pre style="text-align:center">
⚙️ ahh yes, even more data 🔧
</pre>

## API usage
- `https://elternportal-api.now.sh/?username=<username>&password=<password>&action=<action>`
- `username`: Elternportal email
- `password`: Elternportal password
- `action`: one of
  - `stundenplan`
  - `elternbriefe`
  - `wer_macht_was`

## 📚 dependencies

- NodeJS
  - [zombie](https://www.npmjs.com/package/zombie) (Insanely fast, headless full-stack testing using Node.js)
    - a headless browser with some (= pretty limited) DOM capabilties to interact with webpages
  - [express](https://www.npmjs.com/package/express) (minimalist web framework for node)
    - serve the API via web server
  - [cheerio](https://www.npmjs.com/package/cheerio) (core jQuery designed specifically for the server)
    - simplify scraping the page to a readable format
  - [html-minifier](https://www.npmjs.com/package/html-minifier) (highly configurable, well-tested, JavaScript-based HTML minifier)
    - remove whitespace, format html to simplify scraping

## 🚀 deployment
- this script is deployed as a serverless function on the url <https://elternportal-api.now.sh> with [ZEIT Now](https://zeit.co/) ☁️
- the code to this function can be found in the `/api` folder 📁

## ❔ HOWTO: run this function without `ZEIT Now`
```
little heads up:
normally, you would run this with `now dev` - as of Now CLI 16.7.3 dev (beta) this does not work with @now/node
```
- `npm i` / `yarn install`
- `node server.js`

## 🛠️ how this works
- `server.js`
  - STEP 01: start ExpressJS Server listening on port 80
  - STEP 02: parse url parameters
  - STEP 03: get data from server
    - navigate to the target url (e.g. `/service/stundenplan`) with Zombie.js
    - fill out login form + submit
    - > at this point, the user is successfully logged in
    - go 1 back in browser history, so we are at the target url again
    - refresh the page so the browser updates the login state
  - STEP 04: parse the data: Regex
  - STEP 05: output to JSON

## 🛠️ development
- rename `login-data.example.json` to `login-data.json`
- edit `login-data.json` to your login data
- `npm i` / `yarn install`