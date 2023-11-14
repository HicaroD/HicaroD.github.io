import fs from "fs";
import path from "path";
import ejs from "ejs";

const cwd = process.cwd()

const CONFIG_FILE = "./config.json";
const DOCS_DIR = "./docs";
const PARTIALS_DIR = "./partials";
const GENERATOR_CONFIG = {
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

function generateHTMLFiles(renderedHTMLFiles) {
  if (!fs.existsSync(DOCS_DIR)) {
    throw new Error("'docs' directory does not exists");
  }

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${DOCS_DIR}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

function getConfig() {
  const userConfig = fs.readFileSync(CONFIG_FILE).toString();
  const userConfigJson = JSON.parse(userConfig)

  // TODO: read from file created by the user
  return Object.assign(userConfigJson, GENERATOR_CONFIG)
  // return {
  //   // User defined config
  //   site: { title: "Hícaro" },
  //   profile: {
  //     name: "Hícaro Dânrlley",
  //     picture: `assets/images/me.png`,
  //     role: "Software engineer",
  //   },

  //   // Static website config (USER CAN'T CHANGE IT)
  //   metaconfig: {
  //     topbar: [
  //       {
  //         item: "Resume",
  //         path: "resume.html",
  //       },
  //       {
  //         item: "Projects",
  //         path: "projects.html",
  //       },
  //       { item: "Blog", path: "blog.html" },
  //       { item: "CV", path: "cv.html" },
  //     ],
  //     paths: {
  //       layouts: {
  //         topbar: `../layouts/topbar`,
  //         start: `${cwd}/layouts/start`,
  //         end: `${cwd}/layouts/end`,
  //       },
  //       partials: {
  //         home: `${cwd}/partials/home`,
  //       },
  //       css: [
  //         "assets/css/globals.css",
  //         "assets/css/topbar.css",
  //         "assets/css/home.css",
  //       ],
  //     },
  //   },
  // };
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
