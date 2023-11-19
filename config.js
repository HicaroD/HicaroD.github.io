import fs from "fs";

const CONFIG_FILE = "./config.json";
const PROD_PUBLIC_DIR = "./public";
const LOCAL_PUBLIC_DIR = "./_public";
const ASSETS_DIR = "./assets";

export function getEnvironmentSetup() {
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

export function getConfig(environment) {
  const userConfig = fs.readFileSync(CONFIG_FILE).toString();
  const userConfigJson = JSON.parse(userConfig);
  const generatorConfig = getGeneratorConfig(environment);
  return Object.assign(userConfigJson, generatorConfig);
}

export function buildPublicDir(environment) {
  const publicDir = getPublicDirPath(environment);
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true });
  }
  fs.mkdirSync(publicDir);
  fs.cpSync(ASSETS_DIR, `${publicDir}/${ASSETS_DIR}`, { recursive: true });
}

export function getPublicDirPath(environment) {
  return environment === "prod" ? PROD_PUBLIC_DIR : LOCAL_PUBLIC_DIR;
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
