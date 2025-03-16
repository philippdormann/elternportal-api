import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { load as cheerioLoad } from "cheerio";
import { JSDOM } from "jsdom";
import { CookieJar } from "tough-cookie";
// =========
/** gives you a new ElternPortalApiClient instance */
async function getElternportalClient(config) {
    const apiclient = new ElternPortalApiClient(config);
    await apiclient.init();
    return apiclient;
}
class ElternPortalApiClient {
    constructor(config) {
        this.short = "";
        this.username = "";
        this.password = "";
        this.kidId = 0;
        this.csrf = "";
        this.short = config.short;
        this.username = config.username;
        this.password = config.password;
        this.kidId = config.kidId || 0;
        //
        this.jar = new CookieJar();
        this.client = wrapper(axios.create({ jar: this.jar }));
    }
    async init() {
        const { data } = await this.client.request({
            method: "GET",
            url: `https://${this.short}.eltern-portal.org/`,
        });
        const $ = cheerioLoad(data);
        const parsedCSRFToken = $(`[name='csrf']`).val();
        this.csrf = parsedCSRFToken;
        await this.setKid(this.kidId);
    }
    async setKid(kidId) {
        await this.client.request({
            method: "POST",
            url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: {
                csrf: this.csrf,
                username: this.username,
                password: this.password,
                go_to: "",
            },
        });
        const response = await this.client.request({
            method: "POST",
            url: `https://${this.short}.eltern-portal.org/api/set_child.php?id=${kidId}`,
        });
        if (response.data === 1) {
            // console.log("Kid set to:", kidId);
        }
        else {
            // console.log("Failed to set kid to:", kidId);
        }
    }
    /** list all kids in account */
    async getKids() {
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/start`);
        const $ = cheerioLoad(data);
        const kids = [];
        $("select.form-control option").each((_index, element) => {
            const id = parseInt($(element).attr("value") || "0");
            const accountRow = $(element).text().trim();
            const firstName = accountRow.split(" ")[0];
            const lastName = accountRow.split(" ")[1];
            const className = accountRow
                .split(" ")[2]
                .replace("(", "")
                .replace(")", "");
            kids.push({ id, firstName, lastName, className });
        });
        return kids;
    }
    /** get array of blackboard items */
    async getSchwarzesBrett(includeArchived = false) {
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/aktuelles/schwarzes_brett`);
        const $ = cheerioLoad(data);
        const posts = [];
        $(".container .grid-item").each((_index, element) => {
            var _a;
            const dateStart = $(element)
                .find(".text-right")
                .text()
                .trim()
                .replace("eingestellt am ", "")
                .replace(" 00:00:00", "")
                .replace(",,", '"');
            const title = $(element).find("h4").text().trim().replace(",,", '"');
            const content = this.htmlToPlainText($(element)
                .find("p:not(.text-right)")
                .map((_i, el) => $(el).html())
                .get()
                .join("<br>"));
            const link = $(element).find("a").attr("href");
            const id = parseInt((_a = link === null || link === void 0 ? void 0 : link.split("repo=")[1].split("&")[0]) !== null && _a !== void 0 ? _a : "0");
            posts.push({
                id: id == 0 ? this.getIdFromTitle(title) : id,
                dateStart,
                dateEnd: null,
                title,
                content,
                archived: false,
                link,
            });
        });
        if (includeArchived) {
            $(".arch .well").each((_index, element) => {
                var _a;
                const link = $(element).find("a").attr("href");
                const id = parseInt((_a = link === null || link === void 0 ? void 0 : link.split("?")[1].split("repo")[0]) !== null && _a !== void 0 ? _a : "0");
                const title = $(element).find("h4").text().trim().replace(",,", '"');
                const content = $(element)
                    .find(".col-sm-9 p")
                    .text()
                    .replace(",,", '"');
                const dates = $(element).find(".col-md-2 p").text().trim().split(" - ");
                const dateStart = dates[0];
                const dateEnd = dates[1];
                posts.push({
                    id,
                    dateStart,
                    dateEnd,
                    title,
                    content,
                    archived: true,
                    link,
                });
            });
        }
        return posts;
    }
    /** get school infos as key value json array */
    async getSchoolInfos() {
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/service/schulinformationen`);
        const $ = cheerioLoad(data);
        $("table").remove();
        $(".hidden-lg").remove();
        let infos = $("#asam_content").html() || "".replaceAll(`\n`, "<br>");
        const schoolInfos = cheerioLoad(infos)(".row")
            .get()
            .map((ele) => {
            return {
                key: $(ele).find(".col-md-4").text(),
                value: $(ele).find(".col-md-6").html(),
            };
        });
        return schoolInfos;
    }
    /** get termine of entire school */
    async getTermine(from = 0, to = 0) {
        const [param__from, param__to, utc_offset] = this.getFromAndToParams(from, to);
        const { data } = await this.client.request({
            method: "GET",
            url: `https://${this.short}.eltern-portal.org/api/ws_get_termine.php`,
            params: { from: param__from, to: param__to, utc_offset },
        });
        if (data.success === 1) {
            data.result = data.result.map((t) => {
                t.title = t.title.replaceAll("<br />", "<br>").replaceAll("<br>", "\n");
                t.title_short = t.title_short
                    .replaceAll("<br />", "<br>")
                    .replaceAll("<br>", "\n");
                t.startDate = new Date(parseInt(t.start));
                t.endDate = new Date(parseInt(t.end));
                t.bo_end = parseInt(t.bo_end);
                t.id = parseInt(t.id.replace("id_", ""));
                return t;
            });
            data.result = data.result.filter((t) => t.start >= param__from);
            data.result = data.result.filter((t) => t.end <= param__to);
            return data.result;
        }
        return [];
    }
    async getSchulaufgabenplan() {
        const { data } = await this.client.request({
            method: "GET",
            url: `https://${this.short}.eltern-portal.org/service/termine/liste/schulaufgaben#10`,
        });
        const $ = cheerioLoad(data);
        const schulaufgaben = [];
        $(".container #asam_content .row .no_padding_md .table2 tbody tr").each((index, element) => {
            const datum = $(element).find("td").eq(0).text().trim();
            const titel = $(element).find("td").eq(2).text().trim();
            if (titel && datum) {
                const schaulaufgabe = {
                    id: this.getIdFromTitle(titel),
                    title: titel,
                    date: this.toDate(datum),
                };
                schulaufgaben.push(schaulaufgabe);
            }
        });
        return schulaufgaben;
    }
    getFromAndToParams(from = 0, to = 0) {
        const now = Date.now();
        const utc_offset = new Date().getTimezoneOffset();
        let param__from = from;
        if (param__from === 0) {
            param__from = now;
        }
        let param__to = to;
        if (param__to === 0) {
            param__to = now + 1000 * 60 * 60 * 24 * 90;
        }
        //
        if (`${from}`.length !== 13) {
            param__from = parseInt(`${param__from}`.padEnd(13, "0"));
        }
        if (`${to}`.length !== 13) {
            param__to = parseInt(`${param__to}`.padEnd(13, "0"));
        }
        return [param__from, param__to, utc_offset];
    }
    /** get timetable of currently selected kid */
    async getStundenplan() {
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/service/stundenplan`);
        const $ = cheerioLoad(data);
        const tmp = $("#asam_content > div > table > tbody tr td");
        // @ts-ignore
        let rows = [];
        let std = 0;
        tmp.each((_index, element) => {
            // replace <br> with \n to catch all versions 
            $(element).find("br").replaceWith("\n");
            const values = $(element).text().split("\n");
            if ($(element).attr("width") == "15%") {
                const value = parseInt(values[0]);
                std = value;
                const detail = (values[1] || "").replaceAll(".", ":");
                rows.push({ type: "info", value, detail, std });
            }
            else {
                const value = (values[0] || "");
                const detail = (values[1] || "");
                rows.push({ type: "class", value, detail, std });
            }
        });
        // @ts-ignore
        rows = rows.filter((r) => r.std !== null);
        // @ts-ignore
        return rows;
    }
    /** get lost and found items */
    async getFundsachen() {
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/suche/fundsachen`);
        const $ = cheerioLoad(data);
        $("table").remove();
        $(".hidden-lg").remove();
        let fundsachenhtml = $("#asam_content").html().replaceAll(`\n`, "<br>");
        const fundsachen = cheerioLoad(fundsachenhtml)(".row")
            .get()
            .map((ele) => {
            return $(ele).find(".caption").text();
        })
            .filter((f) => f.trim());
        return fundsachen;
    }
    /** get parents letters */
    async getElternbriefe() {
        var _a, _b, _c, _d, _e, _f;
        const { data } = await this.client.get(`https://${this.short}.eltern-portal.org/aktuelles/elternbriefe`);
        const $ = cheerioLoad(data);
        $(".hidden-lg").remove();
        let tmp = $("tr")
            .get()
            .map((ele) => {
            var _a, _b;
            if ($(ele).find("td:first").html().includes("<h4>")) {
                // Suche nach onclick in a oder span
                const clickElement = $(ele).find("[onclick*='eb_bestaetigung']");
                const readConfirmationStringId = (_b = (_a = clickElement.attr("onclick")) === null || _a === void 0 ? void 0 : _a.match(/eb_bestaetigung\((\d+)\)/)[1]) !== null && _b !== void 0 ? _b : undefined;
                const readConfirmationId = readConfirmationStringId
                    ? parseInt(readConfirmationStringId)
                    : undefined;
                // Prüfe, ob es ein a-Element gibt oder nur ein span
                const hasLink = $(ele).find("td:first a").length > 0;
                // Extrahiere Titel - entweder aus a h4 oder aus span h4
                const title = hasLink
                    ? $(ele).find("td:first a h4").text()
                    : $(ele).find("td:first span h4").text();
                $(ele).remove("h4");
                const messageText = $(ele)
                    .find("td:first")
                    .clone()
                    .children()
                    .remove()
                    .end()
                    .text()
                    .trim();
                const classes = $(ele)
                    .find("span[style='font-size: 8pt;']")
                    .text()
                    .replace("Klasse/n: ", "");
                // Link nur, wenn a-Element existiert
                const link = hasLink ? $(ele).find("td:first a").attr("href") : "";
                // Datum entweder aus a oder aus span
                let date = "";
                if (hasLink) {
                    date = $(ele)
                        .find("td:first a")
                        .text()
                        .replace(`${title} `, "");
                }
                else {
                    date = $(ele)
                        .find("td:first span.link_nachrichten")
                        .text()
                        .replace(`${title} `, "")
                        .replace(/\(.*?\)/g, "") // Entferne Text in Klammern
                        .trim();
                }
                $(ele).remove("a");
                return {
                    readConfirmationId,
                    title,
                    messageText,
                    classes,
                    date,
                    link,
                };
            }
            const statusOriginal = $(ele).find("td:last").html();
            let status = "read";
            if (statusOriginal.includes("noch nicht")) {
                status = "unread";
            }
            return {
                id: $(ele).find("td:first").html(),
                status,
            };
        });
        let briefe = [];
        for (let index = 0; index < tmp.length; index += 2) {
            briefe.push({
                id: parseInt(tmp[index].id.replace("#", "")),
                readConfirmationId: tmp[index + 1].readConfirmationId,
                status: (_a = tmp[index].status) !== null && _a !== void 0 ? _a : "unread",
                title: (_b = tmp[index + 1].title) !== null && _b !== void 0 ? _b : "",
                messageText: (_c = tmp[index + 1].messageText) !== null && _c !== void 0 ? _c : "",
                classes: (_d = tmp[index + 1].classes) !== null && _d !== void 0 ? _d : "",
                date: (_e = tmp[index + 1].date) !== null && _e !== void 0 ? _e : "",
                link: (_f = tmp[index + 1].link) !== null && _f !== void 0 ? _f : "",
            });
        }
        return briefe;
    }
    async getSchwarzesBrettFile(id) {
        var _a;
        const schwarzesBrett = await this.getSchwarzesBrett();
        const entry = schwarzesBrett.find((entry) => entry.id === id);
        if (!entry || !entry.link) {
            throw new Error("File from Schwarzesbrett not found");
        }
        const buffer = await this.getFileBuffer((_a = entry === null || entry === void 0 ? void 0 : entry.link) !== null && _a !== void 0 ? _a : "");
        const file = {
            name: entry.title,
            buffer,
        };
        return file;
    }
    async getElternbrief(id, validateElternbriefReceipt = true) {
        var _a;
        const elternbriefe = await this.getElternbriefe();
        const brief = elternbriefe.find((brief) => brief.id === id);
        if (!brief || !brief.link) {
            throw new Error("Elternbrief not found");
        }
        const buffer = await this.getFileBuffer((_a = brief === null || brief === void 0 ? void 0 : brief.link) !== null && _a !== void 0 ? _a : "");
        if (validateElternbriefReceipt) {
            await this.validateElternbriefReceipt(brief);
        }
        const file = {
            name: brief.title,
            buffer,
        };
        return file;
    }
    async validateElternbriefReceipt(elternbrief) {
        if (elternbrief.readConfirmationId) {
            await this.client.get(`https://${this.short}.eltern-portal.org/api/elternbrief_bestaetigen.php?eb=${elternbrief.readConfirmationId}`);
        }
    }
    async getFileBuffer(link) {
        const downloadUrl = `https://${this.short}.eltern-portal.org/${link}`;
        const response = await this.client.get(downloadUrl, {
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        return buffer;
    }
    getIdFromTitle(title) {
        let hash = 5381;
        for (let i = 0; i < title.length; i++) {
            hash = (hash * 33) ^ title.charCodeAt(i); // Multipliziere den Hash und XOR mit dem aktuellen Zeichen
        }
        return hash >>> 0; // Umwandlung in eine positive Ganzzahl
    }
    toDate(dateString) {
        const [day, month, year] = dateString.split(".").map(Number);
        return new Date(year, month - 1, day);
    }
    // timestamp to date
    timestampToDate(timestamp) {
        return new Date(timestamp);
    }
    htmlToPlainText(html) {
        const dom = new JSDOM(html);
        return dom.window.document.body.textContent || "";
    }
}
// =========
export { ElternPortalApiClient, getElternportalClient };
