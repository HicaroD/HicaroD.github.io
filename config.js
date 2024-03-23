import fs from "fs";
import path from "path";
import { getDayMonthYear, getFormattedPath } from "./utils.js";

const CONFIG_FILE = "./config.json";
const ASSETS_DIR = "./assets";
import { PUBLIC_DIR_PATH } from "./env.js";

export function getEnvironmentSetup() {
  const environment = process.env.ENVIRON;
  if (environment === undefined) {
    throw new Error(
      "Consider setting an environment variable, such as 'ENVIRON=prod' or 'ENVIRON=debug'",
    );
  }
  if (environment !== "prod" && environment !== "debug") {
    throw new Error(`Invalid value for ENVIRON variable: '${environment}'`);
  }
  return environment;
}

export function getConfig(environment) {
  const userConfig = getUserConfig();
  const generatorConfig = getGeneratorConfig(userConfig, environment);
  const wholeConfig = Object.assign(userConfig, generatorConfig);
  const formattedConfig = getFormattedConfig(wholeConfig, environment);
  return formattedConfig;
}

function getFormattedConfig(config, environment) {
  for (const key in config) {
    const value = config[key];
    if (fs.existsSync(value)) {
      config[key] = getFormattedPath(config[key], environment);
    } else if (typeof value == "object") {
      config[key] = getFormattedConfig(value, environment);
    }
  }
  return config;
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

  post.title.link = path.basename(post.file, ".html");

  return {
    ...post,
    content: postContent,
    createdAt: getDayMonthYear(birthtime),
    updatedAt: getDayMonthYear(mtime),
  };
}

export function buildPublicDir() {
  if (fs.existsSync(PUBLIC_DIR_PATH)) {
    fs.rmSync(PUBLIC_DIR_PATH, { recursive: true });
  }
  fs.mkdirSync(PUBLIC_DIR_PATH);
  fs.cpSync(ASSETS_DIR, `${PUBLIC_DIR_PATH}/${ASSETS_DIR}`, {
    recursive: true,
  });
}

function getGeneratorConfig(userConfig, environment) {
  const cssFiles = fs
    .readdirSync("assets/css/")
    .filter((filepath) => filepath.endsWith(".css"))
    .map((filepath) => path.join("assets/css/", filepath));

  const layoutFiles = fs
    .readdirSync("./layouts/")
    .filter((filepath) => filepath.endsWith(".ejs"))
    .map((filepath) => fs.realpathSync(path.join("layouts/", filepath)));

  const jsFiles = fs
    .readdirSync("assets/js/")
    .filter((filepath) => filepath.endsWith(".js"))
    .map((filepath) => path.join("assets/js/", filepath));

  const layoutFilesObj = {};
  for (const layoutFilePath of layoutFiles) {
    const { name, dir } = path.parse(layoutFilePath);
    layoutFilesObj[name] = path.join(dir, name);
  }

  const generatorConfig = {
    metaconfig: {
      prod: environment === "prod",
      topbar: getTopBarItems(userConfig, environment),
      paths: {
        layouts: layoutFilesObj,
        css: cssFiles,
        js: jsFiles,
      },
    },
  };
  return generatorConfig;
}

function getTopBarItems(userConfig, environment) {
  const formattedPaths = userConfig.visibility.map((item) => {
    const { dir, base, name } = path.parse(item.path);
    const isProd = environment === "prod";
    const filename = isProd ? name : base;

    item.path = path.join(dir, filename);
    const itemPathWithFolder = item.path;

    return { ...item, path: itemPathWithFolder };
  });

  return formattedPaths;
}
