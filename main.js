import fs from "fs";
import path from "path";
import ejs from "ejs";

import { getEnvironmentSetup, getConfig, buildPublicDir } from "./config.js";
import { isEJSFile } from "./utils.js";

const PARTIALS_DIR = "./partials";

function generateHTMLFiles(renderedHTMLFiles, environment) {
  buildPublicDir(environment);

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${publicDir}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

function renderHTMLFiles(config) {
  const renderedHTMLs = {};

  if(!fs.existsSync(PARTIALS_DIR)) {
    throw new Error("'partials/' folder does not exists.");
  }
  const partialPaths = fs.readdirSync(PARTIALS_DIR);

  for (const partialPath of partialPaths) {
    if (!isEJSFile(partialPath)) {
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
