#!/bin/node

import fs from "fs";
import path from "path";
import ejs from "ejs";

const DOCS_DIR = "./docs";
const PARTIALS_DIR = "./partials";

function generateHTMLFiles(renderedHTMLFiles) {
  if (fs.existsSync(DOCS_DIR)) {
    fs.rmSync(DOCS_DIR, { recursive: true });
  }
  fs.mkdirSync(DOCS_DIR /*, { recursive: true } */);

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${DOCS_DIR}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

function getConfig() {
  const cwd = process.cwd();

  // TODO: read from file created by the user
  return {
    // User defined config
    site: { title: "Hícaro" },
    profile: {
      name: "Hícaro Dânrlley",
      picture: `../assets/images/me.png`,
      role: "Software engineer",
    },

    // Static website config (USER CAN'T CHANGE IT)
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
          "../assets/css/globals.css",
          "../assets/css/topbar.css",
          "../assets/css/home.css",
        ],
      },
    },
  };
}

function renderHTMLFiles(config) {
  const renderedHTMLs = {};

  const partialPaths = fs.readdirSync(PARTIALS_DIR);

  for (const partialPath of partialPaths) {
    if (path.extname(partialPath) !== ".ejs") {
      throw Error(
        `Invalid file in partials folder: ${partialPath}. Only '.ejs' file are allowed`
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
