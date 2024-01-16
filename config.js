import fs from "fs";
import path from "path";
import { getDayMonthYear } from "./utils.js";

const CONFIG_FILE = "./config.json";
const PROD_PUBLIC_DIR = "./public";
const LOCAL_PUBLIC_DIR = "./_public";
const ASSETS_DIR = "./assets";

export function getEnvironmentSetup() {
  const environment = process.env.ENVIRON;
  if (environment === undefined) {
    throw new Error(
      "Consider setting an environment variable, such as 'ENVIRON=prod' or 'ENVIRON=local'"
    );
  }
  if (environment !== "prod" && environment !== "local") {
    throw new Error(`Invalid value for ENVIRON variable: '${environment}'`);
  }
  return environment;
}

export function getConfig(environment) {
  const userConfig = getUserConfig();
  const generatorConfig = getGeneratorConfig(environment);
  return Object.assign(userConfig, generatorConfig);
}

function getUserConfig() {
  const userConfig = fs.readFileSync(CONFIG_FILE).toString();

  const userConfigJson = JSON.parse(userConfig);
  userConfigJson.posts = userConfigJson.posts.map((post) => getPostInfo(post));

  return userConfigJson;
}

function getPostInfo(post) {
  const postContent = fs.readFileSync(post.file).toString();
  const { birthtime, mtime } = fs.lstatSync(post.file);

  post.title.link = path.basename(post.file)

  return {
    ...post,
    content: postContent,
    createdAt: getDayMonthYear(birthtime),
    updatedAt: getDayMonthYear(mtime),
  };
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
  const cssFiles = fs
    .readdirSync("assets/css/")
    .filter((filepath) => filepath.endsWith(".css"))
    .map((filepath) => path.join("assets/css/", filepath));

  const layoutFiles = fs
    .readdirSync("./layouts/")
    .filter((filepath) => filepath.endsWith(".ejs"))
    .map((filepath) => fs.realpathSync(path.join("layouts/", filepath)));

  const layoutFilesObj = {};
  for (const layoutFilePath of layoutFiles) {
    const { name, dir } = path.parse(layoutFilePath);
    layoutFilesObj[name] = path.join(dir, name);
  }

  return {
    metaconfig: {
      prod: environment === "prod",
      home_path: environment === "prod" ? "/" : "index.html",
      // TODO: maybe automate this as well
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
        layouts: layoutFilesObj,
        css: cssFiles,
      },
    },
  };
}
