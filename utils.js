import path from "path";

export function isEJSFile(filePath) {
  return path.extname(filePath) === ".ejs";
}

export function getDayMonthYear(date) {
  return {
    day: date.getUTCDay(),
    month: date.getUTCMonth(),
    year: date.getUTCFullYear(),
  };
}
