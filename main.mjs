#!/bin/node

import fs from "fs";
import ejs from "ejs";

function generateHTMLFiles(renderedHTML) {
  if (!fs.existsSync("public/")) {
    fs.mkdirSync("./public/" /*, { recursive: true } */);
  }

  fs.writeFileSync("./public/index.html", renderedHTML);
  console.log("Files generated successfuly");
}

function getConfig() {
  const cwd = process.cwd();

  // TODO: read from file created by the user
  return {
    site: { title: "Hícaro" },
    profile: {
      name: "Hícaro Dânrlley",
      role: "Software engineer",
    },
    // NOTE: user will not be able to change it
    metaconfig: {
      partials: {
        topbar: `${cwd}/partials/topbar`,
      },
      css: [
        "../assets/css/globals.css",
        "../assets/css/topbar.css",
      ],
    },
  };
}

function main() {
  const layout = fs.readFileSync("./layouts/default.ejs").toString();
  const config = getConfig();
  const renderedHTML = ejs.render(layout, config);
  generateHTMLFiles(renderedHTML);
}

main();
