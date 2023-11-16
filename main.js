import fs from "fs";
import path from "path";
import ejs from "ejs";

const CONFIG_FILE = "./config.json";
const PROD_PUBLIC_DIR = "./public";
const LOCAL_PUBLIC_DIR = "./_public";
const PARTIALS_DIR = "./partials";
const ASSETS_DIR = "./assets";

function getPublicDirPath(environment) {
  return environment === "prod" ? PROD_PUBLIC_DIR : LOCAL_PUBLIC_DIR;
}

function buildPublicDir(environment) {
  const publicDir = getPublicDirPath(environment);
  fs.mkdirSync(publicDir);
  fs.cpSync(ASSETS_DIR, `${publicDir}/${ASSETS_DIR}`, { recursive: true });
}

function generateHTMLFiles(renderedHTMLFiles, environment) {
  const publicDir = getPublicDirPath(environment)

  if (!fs.existsSync(publicDir)) {
    buildPublicDir(environment);
  }

  for (const [filename, renderedHTML] of Object.entries(renderedHTMLFiles)) {
    fs.writeFileSync(`${publicDir}/${filename}`, renderedHTML);
  }

  console.log("Files generated successfuly");
}

function getGeneratorConfig(environment) {
  const cwd = process.cwd();

  return {
    metaconfig: {
      home_path: environment === "prod" ? "/" : "index.html",
      topbar: [
        {
          item: "Resume",
          path: environment === "prod" ? "resume" : "resume.html",
        },
        {
          item: "Projects",
          path: environment === "prod" ? "projects" : "projects.html",
        },
        { item: "Blog", path: environment === "prod" ? "blog" : "blog.html" },
        { item: "CV", path: environment === "prod" ? "cv" : "cv.html" },
      ],
      paths: {
        layouts: {
          topbar: `../layouts/topbar`,
          start: `${cwd}/layouts/start`,
          end: `${cwd}/layouts/end`,
        },
        partials: {
          home: `${cwd}/partials/home`,
        },
        css: [
          "assets/css/globals.css",
          "assets/css/topbar.css",
          "assets/css/home.css",
        ],
      },
    },
  };
}

function getConfig(environment) {
  const userConfig = fs.readFileSync(CONFIG_FILE).toString();
  const userConfigJson = JSON.parse(userConfig);
  const generatorConfig = getGeneratorConfig(environment);
  return Object.assign(userConfigJson, generatorConfig);
}

function renderHTMLFiles(config) {
  const renderedHTMLs = {};

  const partialPaths = fs.readdirSync(PARTIALS_DIR);

  for (const partialPath of partialPaths) {
    if (
      path.extname(partialPath) !== ".ejs" &&
      !fs.lstatSync(partialPath).isDirectory()
    ) {
      throw Error(
        `Invalid file in partials folder: ${partialPath}. Only '.ejs' file are allowed`,
      );
    }
  }

  for (const partialFilename of partialPaths) {
    const fileBasename = path.basename(partialFilename, ".ejs");
    const htmlFileVersion = fileBasename + ".html";

    const partialFilepath = `${PARTIALS_DIR}/${partialFilename}`;
    const partialFile = fs.readFileSync(partialFilepath).toString();

    const renderedHTML = ejs.render(partialFile, config);
    renderedHTMLs[htmlFileVersion] = renderedHTML;
  }

  return renderedHTMLs;
}

function getEnvironmentSetup() {
  const environment = process.env.ENVIRON;
  if (environment === undefined) {
    throw new Error(
      "Consider setting an environment variable, such as 'ENVIRON=prod' or 'ENVIRON=local'",
    );
  }
  if (environment !== "prod" && environment !== "local") {
    throw new Error(`Invalid value for ENVIRON variable: '${environment}'`);
  }
  return environment;
}

function main() {
  const environment = getEnvironmentSetup();
  const config = getConfig(environment);
  const renderedHTMLFiles = renderHTMLFiles(config);
  generateHTMLFiles(renderedHTMLFiles, environment);
}

main();
