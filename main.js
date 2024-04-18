import fs from "fs";
import path from "path";
import ejs from "ejs";

import { getConfig, buildPublicDir } from "./config.js";
import { getEnvironmentSetup } from "./env.js";
import { isEJSFile } from "./utils.js";

import { PUBLIC_DIR_PATH } from "./env.js";

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
}

function generateBlogPosts(renderedBlogPosts) {
  for (let [postFilename, blogPost] of Object.entries(renderedBlogPosts)) {
    if (!postFilename.endsWith(".html")) {
      postFilename = postFilename + ".html";
    }
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
        `Invalid file in partials folder: ${partialPath}. Only '.ejs' file are allowed`,
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

  config.posts.forEach((blogPost) => {
    const renderedHTML = ejs.render(blogPostPartial, {
      ...config,
      currentPost: blogPost,
    });
    renderedHTMLs["blog"][blogPost.title.file] = renderedHTML;
  });
}

function main() {
  const environment = getEnvironmentSetup();
  const config = getConfig(environment);
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles, environment);
}

main();
