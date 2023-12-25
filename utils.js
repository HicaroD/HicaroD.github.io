import path from "path";

export function isEJSFile(filePath) {
  return path.extname(filePath) === ".ejs";
}

export function getDayMonthYear(date) {
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}
