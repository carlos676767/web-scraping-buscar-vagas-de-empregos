import * as cheerio from "cheerio";
import pupper from "puppeteer";
import fs from "fs";
import path from "path";
class BrowserManager {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  protected async openBrowser(): Promise<string | undefined> {
    try {
      const browser = await pupper.launch({ headless: false });
      const page = await browser.newPage();
      const valideMyUrl = BrowserManager.valideUrl(this.url);
      if (!valideMyUrl) {
        browser.close();
        throw new Error("enter a valid url");
      }

      await page.goto(this.url);
      const result = await page.content();
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  private static valideUrl(url: string): boolean {
    const regex =  /^(https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:[0-9]+)?(\/[^\s]*)?$/i;
    return regex.test(url);
  }
}

class GetVagas extends BrowserManager {
  constructor(url: string) {
    super(url);
  }

    public async getVagas() {
      const pageBrowser = await this.openBrowser();
      if (pageBrowser) {
        const $ = cheerio.load(pageBrowser);
        $("a").each((i, elemento) => {
          const url = $(elemento).attr("href");
          const filtradas = url ?.split(" ").filter((data) => data.startsWith("https://"));
          if (filtradas) GetVagas.writeVacancies(filtradas)
        });
      }
    }

  private static writeVacancies(arrFilter: string[]) {
    const caminho = path.join(__dirname, "jobListings", "vagas.txt");
    arrFilter.forEach((data) => {
      fs.appendFile(caminho, data + "\n", (err) => {
        if (err) throw new Error("error when writing vacancies");
      });
    });
    console.log("")
  }
}

new GetVagas("https://www.google.com/search?q=estagio+sorriso+mt").getVagas();
