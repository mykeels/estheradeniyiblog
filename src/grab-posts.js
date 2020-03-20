const { default: axios } = require("axios");
const cheerio = require("cheerio");
const { promises: fs, existsSync } = require("fs");
const path = require("path");
const h2m = require('h2m');

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
      console.log(loc);
      if (existsSync(path.join(folderPath, 'README.md'))) continue;
      
      const res = await axios.get(loc, { responseType: "text" });

      const $ = cheerio.load(res.data);

      const articleHtml = $('main').html();
      const title = $('h1').text().trim();
      let markdownBody = h2m(articleHtml);

      try {
        await fs.mkdir(folderPath);
        await fs.mkdir(imagesFolderPath);
        await fs.mkdir(pdfFolderPath);
      }
      catch {}

      for (const image of distinctImages) {
        console.log("  -", image.loc);
        const [filename] = image.loc.split("/").slice(-1);
        if (!existsSync(path.join(imagesFolderPath, filename))) {
          const res = await axios.get(image.loc, { responseType: "arraybuffer" });
          await fs.writeFile(path.join(imagesFolderPath, filename), res.data);
          markdownBody = markdownBody.replace(new RegExp(image.loc, 'g'), path.join('images', filename));
        }
      }

      const markdown = [
          `# ${title}`,
          ``,
          `${markdownBody}`
      ];

      await fs.writeFile(path.join(folderPath, 'README.md'), markdown.join('\n'));


    }
  }
})();
