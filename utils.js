import path from "path";

export function isEJSFile(filePath) {
  return path.extname(filePath) === ".ejs";
}

export function getDayMonthYear(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedDate = formatter.format(date)
  return formattedDate;
}
