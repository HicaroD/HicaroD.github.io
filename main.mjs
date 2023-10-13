#!/bin/node

import fs from "fs";
import ejs from "ejs";

function main() {
  const layout = fs.readFileSync("./layouts/default.ejs").toString();

  const renderedHTML = ejs.render(layout, {
    site: { title: "website" },
  });

  if (!fs.existsSync("public/")) {
    fs.mkdirSync("./public/" /* { recursive: true } */);
  }

  fs.writeFileSync("./public/index.html", renderedHTML);
  console.log("Files generated successfuly");
}

main();
