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
    // User defined config
    site: { title: "Hícaro" },
    profile: {
      name: "Hícaro Dânrlley",
      picture: `../assets/images/me.png`,
      role: "Software engineer",
    },

    // Static website config (USER CAN'T CHANGE IT)
    metaconfig: {
      paths: {
        partials: {
          topbar: `${cwd}/partials/topbar`,
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

function main() {
  const layout = fs.readFileSync("./layouts/default.ejs").toString();
  const config = getConfig();
  const renderedHTML = ejs.render(layout, config);
  generateHTMLFiles(renderedHTML);
}

main();
