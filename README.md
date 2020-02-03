# gymh-elternportal-API
### scraper for <https://heraugy.eltern-portal.org> (or *.eltern-portal.org)
<pre style="text-align:center">
⚙️ yes, even more data 🔧
</pre>

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
- this script will be deployed as a serverless function with [ZEIT Now](https://zeit.co/) ☁️
- the code to this function will be found in the `/api` folder 📁

## ❔ HOWTO: run this function without `ZEIT Now`
```
little heads up:
normally, you would run this with `now dev` - as of Now CLI 16.7.3 dev (beta) this does not work with @now/node
```
- `npm i` / `yarn install`
- `node zombie.js`

## 🛠️ how this works
- STEP 01: get data from <https://mensadigital.de/LOGINPLAN.ASPX?P=FO111&E=herz>
  - setup request
    - enable cookies (`very important`)
    - request method: POST (`very important`)
    - enable followAllRedirects (`very important`)
    - set login headers (`very important`)
- STEP 02: parse the data
- 
- STEP 05 (`optional`): serve via express/ output to file

## 🛠️ development
- rename `login-data.example.json` to `login-data.json`
- edit `login-data.json` to your login data