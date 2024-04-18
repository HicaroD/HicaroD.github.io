import path from "path";
import { PUBLIC_DIR_PATH } from "./env.js";

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

// TODO: refactor this method, is there a better way to deal with theses paths?
export function getFormattedPath(unformattedPath, environment) {
  const currentDir = path.resolve("./");
  let formattedPath = path.resolve(unformattedPath).replace(currentDir, "");

  if (formattedPath.startsWith("/" + PUBLIC_DIR_PATH)) {
    formattedPath = formattedPath.replace("/" + PUBLIC_DIR_PATH, "");
  }
  if (formattedPath.startsWith("/" + "_posts")) {
    formattedPath = formattedPath.replace("/_posts", "");
  }
  if (formattedPath.endsWith(".html") && environment === "prod") {
    formattedPath = formattedPath.replace(".html", "");
  }
  return formattedPath;
}
