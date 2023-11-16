import fs from "fs";
import path from "path";
import ejs from "ejs";

import { getEnvironmentSetup, getConfig, getPublicDirPath } from "./config.js";

const PARTIALS_DIR = "./partials";

function generateHTMLFiles(renderedHTMLFiles, environment) {
  const publicDir = getPublicDirPath(environment);

  if (!fs.existsSync(publicDir)) {
    buildPublicDir(environment);
  }

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${publicDir}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
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
  const environment = getEnvironmentSetup();
  const config = getConfig(environment);
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles, environment);
}

main();
