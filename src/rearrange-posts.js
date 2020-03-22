const { promises: fs, existsSync } = require("fs");
const path = require("path");
let { urls } = require('./sitemap.json');
const { format } = require('date-fns');

urls = urls.map(url => ({
    ...url,
    lastmod: new Date(url.lastmod)
})).sort((a, b) => {
    return a.lastmod < b.lastmod ? -1 : 
    (
        b.lastmod > a.lastmod ? 1 : 0
    )
});

const getPostTitle = async name => {
    const folderPath = path.join("../", "pages/posts", name);
    const file = path.join(folderPath, 'README.md');

    const text = await fs.readFile(file, 'utf8');
    const [firstLine] = text.split('\n');
    return firstLine.replace('# ', '').trim();
}

(async () => {
    await fs.writeFile(path.join('../', 'pages/posts/MOD_README.md'), '', 'utf8');
    for (let { loc, lastmod } of urls )
    {
        const [name] = loc
        .replace(/\/$/g, "")
        .split("/")
        .slice(-1);

        if (name === "estheradeniyi.com") continue;

        const title = await getPostTitle(name);
        const articleReadmePath = path.join(name, 'README.md')
        const date =  format(new Date(lastmod), 'PP p')

        console.log(`- [${title}](${articleReadmePath})`, '|', date);
        await fs.appendFile(
            path.join('../', 'pages/posts/MOD_README.md'), 
            `- [${title}](${articleReadmePath}) | ${date}\n`,
            'utf8'
        );
    }
})();