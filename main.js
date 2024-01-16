import fs from "fs";
import path from "path";
import ejs from "ejs";

import {
  getEnvironmentSetup,
  getConfig,
  buildPublicDir,
  getPublicDirPath,
} from "./config.js";
import { isEJSFile } from "./utils.js";

const PARTIALS_DIR = "./partials";

function generateHTMLFiles(renderedHTMLFiles, environment) {
  const publicDir = getPublicDirPath(environment);
  buildPublicDir(environment);

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${publicDir}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

// TODO: this method is too big
function renderHTMLFiles(config) {
  const renderedHTMLs = {};

  if (!fs.existsSync(PARTIALS_DIR)) {
    throw new Error("'partials/' directory does not exists.");
  }
  const partialPaths = fs.readdirSync(PARTIALS_DIR);

  for (const partialPath of partialPaths) {
    if (!isEJSFile(partialPath)) {
      throw Error(
        `Invalid file in partials folder: ${partialPath}. Only '.ejs' file are allowed`
      );
    }
  }

  for (const partialFilename of partialPaths) {
    if (partialFilename == "post.ejs") {
      continue;
    }
    const fileBasename = path.basename(partialFilename, ".ejs");
    const htmlFileVersion = fileBasename + ".html";

    const partialFilepath = `${PARTIALS_DIR}/${partialFilename}`;
    const partialFile = fs.readFileSync(partialFilepath).toString();

    const renderedHTML = ejs.render(partialFile, config);
    renderedHTMLs[htmlFileVersion] = renderedHTML;
  }

  const blogPostPartial = fs.readFileSync(`${PARTIALS_DIR}/post.ejs`).toString();
  const blogPosts = fs.readdirSync("_posts");

  blogPosts.forEach((blogPostFilename, blogPostIndex) => {
    const configWithBlogPostIndex = {
      blogPostIndex,
      ...config,
    };
    const renderedHTML = ejs.render(blogPostPartial, configWithBlogPostIndex);
    renderedHTMLs[blogPostFilename] = renderedHTML;
  });

  return renderedHTMLs;
}

function main() {
  const environment = getEnvironmentSetup();
  const config = getConfig(environment);
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles, environment);
}

main();
