import fs from "fs";
import path from "path";
import ejs from "ejs";

import { getEnvironmentSetup, getConfig, buildPublicDir } from "./config.js";
import { isEJSFile } from "./utils.js";

import { PUBLIC_DIR_PATH } from "env.js";

const PARTIALS_DIR = "./partials";

function generateHTMLFiles(renderedHTMLFiles) {
  buildPublicDir();

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    if (filename == "blog") {
      continue;
    }
    fs.writeFileSync(`${PUBLIC_DIR_PATH}/${filename}`, renderedHTML);
  }
  generateBlogPosts(renderedHTMLFiles["blog"], PUBLIC_DIR_PATH);
  console.log("Files generated successfuly");
}

function generateBlogPosts(renderedBlogPosts) {
  for (const [postFilename, blogPost] of Object.entries(renderedBlogPosts)) {
    fs.writeFileSync(`${PUBLIC_DIR_PATH}/${postFilename}`, blogPost);
  }
}

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

  generateWebsitePagesContent(renderedHTMLs, partialPaths, config);
  generateBlogPostsContent(renderedHTMLs, config);
  return renderedHTMLs;
}

function generateWebsitePagesContent(renderedHTMLs, partialPaths, config) {
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
}

function generateBlogPostsContent(renderedHTMLs, config) {
  renderedHTMLs["blog"] = {};

  const blogPostPartial = fs
    .readFileSync(`${PARTIALS_DIR}/post.ejs`)
    .toString();
  const blogPosts = fs.readdirSync("_posts");

  blogPosts.forEach((blogPostFilename, blogPostIndex) => {
    const configWithBlogPostIndex = {
      blogPostIndex,
      ...config,
    };
    const renderedHTML = ejs.render(blogPostPartial, configWithBlogPostIndex);
    renderedHTMLs["blog"][blogPostFilename] = renderedHTML;
  });
}

function main() {
  const environment = getEnvironmentSetup();
  const config = getConfig(environment);
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles, environment);
}

main();
