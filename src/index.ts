import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { load as cheerioLoad } from "cheerio";
import { JSDOM } from "jsdom";
import { CookieJar } from "tough-cookie";

//
type Kid = {
  name: string;
  id: number;
};
type SchoolInfo = {
  key: string;
  value: string;
};
type Termin = {
  id: number;
  title: string;
  title_short: string;
  class: "event-info";
  bo_end: 0 | 1;
  start: number;
  end: number;
};
type Elternbrief = {
  id: number;
  status: string;
  title: string;
  messageText: string;
  classes: string;
  date: string;
  link: string;
};
type ElternPortalApiClientConfig = {
  short: string;
  username: string;
  password: string;
};
type InfoBox = {
  archived: Boolean;
  dateStart: string;
  dateEnd: string | null;
  title: string;
  content: string;
};
// =========
/** gives you a new ElternPortalApiClient instance */
async function getElternportalClient(
  config: ElternPortalApiClientConfig
): Promise<InstanceType<typeof ElternPortalApiClient>> {
  const apiclient = new ElternPortalApiClient(config);
  await apiclient.init();
  return apiclient;
}
class ElternPortalApiClient {
  jar: CookieJar;
  client: AxiosInstance;
  short: string = "";
  username: string = "";
  password: string = "";
  csrf: string = "";
  constructor(config: ElternPortalApiClientConfig) {
    this.short = config.short;
    this.username = config.username;
    this.password = config.password;
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
    const parsedCSRFToken = $(`[name='csrf']`).val() as string;
    this.csrf = parsedCSRFToken;
  }

  // currently under development
  async setKid(kidId: number) {
    // 1: Login
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
        // 2: navigate to the api endpoint to set the child
        go_to: `api/set_child.php?id=${kidId}`,
        // 3: implement a go_to2 parameter to navigate to the desired page
      },
    });
  }
  /** list all kids in account */
  async getKids(): Promise<Kid[]> {
    const { data } = await this.client.request({
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
    const $ = cheerioLoad(data);

    const kids: Kid[] = [];

    $("select.form-control option").each((_index: number, element) => {
      const id = parseInt($(element).attr("value") || "0");
      const name = $(element).text().trim();

      kids.push({ id, name });
    });

    return kids;
  }

  /** get array of blackboard items */
  async getSchwarzesBrett(includeArchived = false): Promise<InfoBox[]> {
    const { data } = await this.client.request({
      method: "POST",
      url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        csrf: this.csrf,
        username: this.username,
        password: this.password,
        go_to: "aktuelles/schwarzes_brett",
      },
    });
    const $ = cheerioLoad(data);
    const posts: InfoBox[] = [];

    $(".container .grid-item").each((_index: number, element) => {
      const dateStart = $(element)
        .find(".text-right")
        .text()
        .trim()
        .replace("eingestellt am ", "")
        .replace(" 00:00:00", "")
        .replace(",,", '"');
      const title = $(element).find("h4").text().trim().replace(",,", '"');
      const content = this.htmlToPlainText(
        $(element)
          .find("p:not(.text-right)")
          .map((_i, el) => $(el).html())
          .get()
          .join("<br>")
      );

      posts.push({ dateStart, dateEnd: null, title, content, archived: false });
    });

    if (includeArchived) {
      $(".arch .well").each((_index: number, element) => {
        const title = $(element).find("h4").text().trim().replace(",,", '"');
        const content = $(element)
          .find(".col-sm-9 p")
          .text()
          .replace(",,", '"');
        const dates = $(element).find(".col-md-2 p").text().trim().split(" - ");
        const dateStart = dates[0];
        const dateEnd = dates[1];

        posts.push({ dateStart, dateEnd, title, content, archived: true });
      });
    }

    return posts;
  }
  /** get school infos as key value json array */
  async getSchoolInfos(): Promise<SchoolInfo[]> {
    const { data } = await this.client.request({
      method: "POST",
      url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        csrf: this.csrf,
        username: this.username,
        password: this.password,
        go_to: "service/schulinformationen",
      },
    });
    const $ = cheerioLoad(data);
    $("table").remove();
    $(".hidden-lg").remove();
    let infos =
      ($("#asam_content").html() as string) || "".replaceAll(`\n`, "<br>");
    const schoolInfos = cheerioLoad(infos)(".row")
      .get()
      .map((ele) => {
        return {
          key: $(ele).find(".col-md-4").text(),
          value: $(ele).find(".col-md-6").html() as string,
        };
      });
    return schoolInfos;
  }
  /** get termine of entire school */
  async getTermine(from = 0, to = 0): Promise<Termin[]> {
    const now = Date.now();
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
        go_to: "service/termine",
      },
    });
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
    const { data } = await this.client.request({
      method: "GET",
      url: `https://${this.short}.eltern-portal.org/api/ws_get_termine.php`,
      params: { from: param__from, to: param__to, utc_offset },
    });
    if (data.success === 1) {
      data.result = data.result.map((t: any) => {
        t.title = t.title.replaceAll("<br />", "<br>").replaceAll("<br>", "\n");
        t.title_short = t.title_short
          .replaceAll("<br />", "<br>")
          .replaceAll("<br>", "\n");
        t.start = parseInt(t.start);
        t.end = parseInt(t.end);
        t.bo_end = parseInt(t.bo_end);
        t.id = parseInt(t.id.replace("id_", ""));
        return t;
      });
      data.result = data.result.filter((t: any) => t.start >= param__from);
      data.result = data.result.filter((t: any) => t.end <= param__to);
      return data.result;
    }
    return [];
  }
  /** get timetable of currently selected kid */
  async getStundenplan(): Promise<any> {
    const { data } = await this.client.request({
      method: "POST",
      url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        csrf: this.csrf,
        username: this.username,
        password: this.password,
        go_to: "service/stundenplan",
      },
    });
    const tmp = cheerioLoad(data)(
      "#asam_content > div > table > tbody tr td"
    ).get();
    // @ts-ignore
    let rows = [];
    let std = 0;
    tmp.forEach((r) => {
      const rowsDOM = cheerioLoad(r)("td").get();
      // @ts-ignore
      let cols = [];
      rowsDOM.forEach((t) => {
        const rowHTML = cheerioLoad(t).html();
        if (rowHTML.includes('width="15%"')) {
          const arr1 = (rowHTML || "").split("<br>");
          const value = parseInt(
            (arr1[0] || "").split(">")[1].replace(".", "")
          );
          std = value;
          // const value = std
          const detail = (arr1[1] || "").split("<")[0].replaceAll(".", ":");
          rows.push({ type: "info", value, detail, std });
        } else {
          const arr1 = (rowHTML || "").split("<br>");
          const value = (arr1[0] || "").split('<span class="">')[1];
          const detail = (arr1[1] || "").split(" </span>")[0];
          rows.push({ type: "class", value, detail, std });
        }
        // std++
      });
      // @ts-ignore
      // @ts-ignore
      // rows.push(cols);
    });
    // @ts-ignore
    rows = rows.filter((r) => r.std !== null);
    // rows = rows.filter(r => r.std === null)
    // @ts-ignore
    return rows;
  }
  /** get lost and found items */
  async getFundsachen(): Promise<string[]> {
    const { data } = await this.client.request({
      method: "POST",
      url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        csrf: this.csrf,
        username: this.username,
        password: this.password,
        go_to: "suche/fundsachen",
      },
    });
    const $ = cheerioLoad(data);
    $("table").remove();
    $(".hidden-lg").remove();
    let fundsachenhtml = ($("#asam_content").html() as string).replaceAll(
      `\n`,
      "<br>"
    );
    const fundsachen = cheerioLoad(fundsachenhtml)(".row")
      .get()
      .map((ele: any) => {
        return $(ele).find(".caption").text();
      })
      .filter((f) => f.trim());
    return fundsachen;
  }
  /** get parents letters */
  async getElternbriefe(): Promise<Elternbrief[]> {
    const { data } = await this.client.request({
      method: "POST",
      url: `https://${this.short}.eltern-portal.org/includes/project/auth/login.php`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        csrf: this.csrf,
        username: this.username,
        password: this.password,
        go_to: "aktuelles/elternbriefe",
      },
    });
    const $ = cheerioLoad(data);
    $(".hidden-lg").remove();
    let tmp = $("tr")
      .get()
      .map((ele) => {
        if (($(ele).find("td:first").html() as string).includes("<h4>")) {
          const title = $(ele).find("td:first a h4").text();
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
          const link = $(ele).find("td:first a").attr("href");
          const date = $(ele)
            .find("td:first a")
            .text()
            .replace(`${title} `, "");
          $(ele).remove("a");
          return {
            title,
            messageText,
            classes,
            link,
            date,
            info: $(ele).find("td:last").text(),
          };
        }
        const statusOriginal = $(ele).find("td:last").html() as string;
        let status = "read";
        if (statusOriginal.includes("noch nicht")) {
          status = "unread";
        }
        return {
          id: $(ele).find("td:first").html(),
          status,
        };
      });
    let briefe: Elternbrief[] = [];
    for (let index = 0; index < tmp.length; index += 2) {
      briefe.push({
        id: parseInt((tmp[index].id as string).replace("#", "")),
        status: tmp[index].status ?? "unread",
        title: tmp[index + 1].title ?? "",
        messageText: tmp[index + 1].messageText ?? "",
        classes: tmp[index + 1].classes ?? "",
        date: tmp[index + 1].date ?? "",
        link: tmp[index + 1].link ?? "",
      });
    }
    return briefe;
  }

  private htmlToPlainText(html: string): string {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || "";
  }
}
// =========
export { ElternPortalApiClient, getElternportalClient };

