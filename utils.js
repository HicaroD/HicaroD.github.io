import path from "path";
import { getPublicDirPath } from "./config.js";

export function isEJSFile(filePath) {
  return path.extname(filePath) === ".ejs";
}

export function getDayMonthYear(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedDate = formatter.format(date);
  return formattedDate;
}

export function getFormattedPath(unformattedPath, environment) {
  const publicDirName = getPublicDirPath();
  const currentDir = path.resolve("./");

  let formattedPath = path.resolve(unformattedPath).replace(currentDir, "");
  if (formattedPath.startsWith("/" + publicDirName)) {
    formattedPath = formattedPath.replace("/" + publicDirName, "");
  }
  if (formattedPath.startsWith("/" + "_posts")) {
    formattedPath = formattedPath.replace("/_posts", "/blog");
  }
  if (formattedPath.endsWith(".html") && environment === "prod") {
    formattedPath = formattedPath.replace(".html", "");
    console.log(formattedPath)
  }
  return formattedPath;
}
