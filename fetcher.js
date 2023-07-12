import * as cheerio from "cheerio"
import axios from "axios"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie";
// 
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
// =========
let csrf = undefined;
async function loadCSRF({ short = "" }) {
    if (csrf) return csrf;
    const { data } = await client.request({
        method: 'GET',
        url: `https://${short}.eltern-portal.org/`
    })
    const $ = cheerio.load(data);
    csrf = $(`[name='csrf']`).val();
    return csrf;
}
async function getKids({ short = "", username = "", password = "" }) {
    const csrf = await loadCSRF({ short });
    const { data } = await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: ''
        }
    })
    const $ = cheerio.load(data);
    const kids = [{ name: $(`.pupil-selector select option`).text().replace(/^\s+|\s+$/g, ''), id: $(`.pupil-selector select option`).val() }]
    return kids;
}
async function getSchoolInfos({ short = "", username = "", password = "" }) {
    const csrf = await loadCSRF({ short });
    const { data } = await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: 'service/schulinformationen'
        }
    })
    const $ = cheerio.load(data);
    $("table").remove();
    $(".hidden-lg").remove();
    let infos = $("#asam_content").html().replaceAll(`\n`, "<br>");
    infos = cheerio.load(infos)('.row').get().map(ele => {
        return {
            key: $(ele).find('.col-md-4').text(),
            value: $(ele).find('.col-md-6').html()
        }
    })
    return infos;
}
async function getTermine({ short = "", username = "", password = "", from, to }) {
    const csrf = await loadCSRF({ short });
    await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: 'service/termine'
        }
    })
    const { data } = await client.request({
        method: 'GET',
        url: `https://${short}.eltern-portal.org/api/ws_get_termine.php`,
        params: { from, to, utc_offset: '-120' }
    })
    if (data.success === 1) return data.result;
    return [];
}
async function getFundsachen({ short = "", username = "", password = "" }) {
    const csrf = await loadCSRF({ short });
    const { data } = await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: 'suche/fundsachen'
        }
    })
    const $ = cheerio.load(data);
    $("table").remove();
    $(".hidden-lg").remove();
    let fundsachen = $("#asam_content").html().replaceAll(`\n`, "<br>");
    fundsachen = cheerio.load(fundsachen)('.row').get().map(ele => {
        return $(ele).find('.caption').text()
    }).filter(f => f.trim())
    return fundsachen;
}
async function getElternbriefe({ short = "", username = "", password = "" }) {
    const csrf = await loadCSRF({ short });
    const { data } = await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: 'aktuelles/elternbriefe'
        }
    })
    const $ = cheerio.load(data);
    $(".hidden-lg").remove();
    let tmp = $('tr').get().map(ele => {
        if ($(ele).find('td:first').html().includes("<h4>")) {
            const title = $(ele).find('td:first a h4').text();
            $(ele).remove("h4");
            const link = $(ele).find('td:first a').attr("href");
            const date = $(ele).find('td:first a').text().replace(`${title} `, "");
            $(ele).remove("a");
            return {
                title,
                link,
                date,
                info: $(ele).find('td:last').text()
            }
        }
        return {
            id: $(ele).find('td:first').html(),
            status: $(ele).find('td:last').html()
        }
    })
    let briefe = [];
    for (let index = 0; index < tmp.length; index += 2) {
        briefe.push({ id: parseInt(tmp[index].id.replace("#", "")), status: tmp[index].status, title: tmp[index + 1].title, date: tmp[index + 1].date, link: tmp[index + 1].link })
    }
    return briefe;
}
async function getFile({ file = "", short = "", username = "", password = "" }) {
    const csrf = await loadCSRF({ short });
    await client.request({
        method: 'POST',
        url: `https://${short}.eltern-portal.org/includes/project/auth/login.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            csrf,
            username,
            password,
            go_to: 'aktuelles/elternbriefe'
        }
    })
    // const res = await client.get(`https://${short}.eltern-portal.org/aktuelles/get_file/?repo=${file}&csrf=${csrf}`, { responseType: 'arraybuffer' });
    // writeFileSync("./out.pdf", res.data);
    return {};
}
export { getElternbriefe, getKids, getSchoolInfos, getTermine, getFundsachen, getFile }