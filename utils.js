import path from "path";

export function isEJSFile(filePath) {
  return path.extname(filePath) === ".ejs";
}
