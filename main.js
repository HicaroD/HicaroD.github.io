import fs from "fs";
import path from "path";
import ejs from "ejs";

const CONFIG_FILE = "./config.json";
const PUBLIC_DIR = "./public";
const PARTIALS_DIR = "./partials";
const ASSETS_DIR = "./assets";

function generateHTMLFiles(renderedHTMLFiles) {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
    fs.cpSync(ASSETS_DIR, `${PUBLIC_DIR}/${ASSETS_DIR}`, { recursive: true });
  }

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${PUBLIC_DIR}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

function getGeneratorConfig() {
  const cwd = process.cwd();

  return {
    metaconfig: {
      topbar: [
        {
          item: "Resume",
          path: "resume.html",
        },
        {
          item: "Projects",
          path: "projects.html",
        },
        { item: "Blog", path: "blog.html" },
        { item: "CV", path: "cv.html" },
      ],
      paths: {
        layouts: {
          topbar: `../layouts/topbar`,
          start: `${cwd}/layouts/start`,
          end: `${cwd}/layouts/end`,
        },
        partials: {
          home: `${cwd}/partials/home`,
        },
        css: [
          "assets/css/globals.css",
          "assets/css/topbar.css",
          "assets/css/home.css",
        ],
      },
    },
  };
}

function getConfig() {
  const userConfig = fs.readFileSync(CONFIG_FILE).toString();
  const userConfigJson = JSON.parse(userConfig);
  const generatorConfig = getGeneratorConfig();
  return Object.assign(userConfigJson, generatorConfig);
}

function renderHTMLFiles(config) {
  const renderedHTMLs = {};

  const partialPaths = fs.readdirSync(PARTIALS_DIR);

  for (const partialPath of partialPaths) {
    if (
      path.extname(partialPath) !== ".ejs" &&
      !fs.lstatSync(partialPath).isDirectory()
    ) {
      throw Error(
        `Invalid file in partials folder: ${partialPath}. Only '.ejs' file are allowed`,
      );
    }
  }

  for (const partialFilename of partialPaths) {
    const fileBasename = path.basename(partialFilename, ".ejs");
    const htmlFileVersion = fileBasename + ".html";

    const partialFilepath = `${PARTIALS_DIR}/${partialFilename}`;
    const partialFile = fs.readFileSync(partialFilepath).toString();

    const renderedHTML = ejs.render(partialFile, config);
    renderedHTMLs[htmlFileVersion] = renderedHTML;
  }

  return renderedHTMLs;
}

function main() {
  const config = getConfig();
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles);
}

main();
