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
  const cssFiles = fs
    .readdirSync("assets/css/")
    .filter((path) => path.endsWith(".css"))
    .map((path) => "assets/css/" + path);

  return {
    metaconfig: {
      prod: environment === "prod",
      home_path: environment === "prod" ? "/" : "index.html",
      topbar: [
        {
          item: "Resume",
          path: environment === "prod" ? "resume" : "resume.html",
          prod: true,
        },
        {
          item: "Projects",
          path: environment === "prod" ? "projects" : "projects.html",
          prod: true,
        },
        {
          item: "Blog",
          path: environment === "prod" ? "blog" : "blog.html",
          prod: false,
        },
        {
          item: "CV",
          path: environment === "prod" ? "cv" : "cv.html",
          prod: false,
        },
      ],
      paths: {
        layouts: {
          topbar: `${cwd}/layouts/topbar`,
          start: `${cwd}/layouts/start`,
          end: `${cwd}/layouts/end`,
        },
        css: cssFiles,
      },
    },
  };
}
