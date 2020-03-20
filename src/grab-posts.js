const { default: axios } = require("axios");
const cheerio = require("cheerio");
const { promises: fs } = require("fs");
const path = require("path");

const relativeUrl = process.env.URL || "";
const { urls } = require("./sitemap.json");

(async () => {
  for (const { loc, lastmod, images } of urls) {
    const lastModDate = new Date(lastmod);
    const distinctImages = Object.values(
      (images || []).reduce((obj, item) => ({ ...obj, [item.loc]: item }), {})
    );

    const [name] = loc
      .replace(/\/$/g, "")
      .split("/")
      .slice(-1);
    const folderPath = path.join("../", "pages/posts", name);
    const imagesFolderPath = path.join(folderPath, "images");
    const pdfFolderPath = path.join(folderPath, "pdf");

    if (name !== "estheradeniyi.com") {
      const { data: html } = await axios.get(loc, { responseType: "text" });

      const $ = cheerio.load(html);

      console.log($('main').html());

      await fs.mkdir(folderPath);
      await fs.mkdir(imagesFolderPath);
      await fs.mkdir(pdfFolderPath);

      for (const image of distinctImages) {
        console.log("  -", image.loc);
        const res = await axios.get(image.loc, { responseType: "arraybuffer" });
        const [filename] = image.loc.split("/").slice(-1);
        await fs.writeFile(path.join(imagesFolderPath, filename), res.data);
      }
    }
  }
})();
