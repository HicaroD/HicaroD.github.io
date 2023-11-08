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

function main() {
  const layout = fs.readFileSync("./layouts/default.ejs").toString();

  // TODO: read from file
  const config = {
    site: { title: "Hicaro's website" },
    profile: {
      name: "Hícaro Dânrlley",
      role: "Software engineer",
    },
  };
  const renderedHTML = ejs.render(layout, config);

  generateHTMLFiles(renderedHTML);
}

main();
