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
      "Consider setting an environment variable, such as 'ENVIRON=prod' or 'ENVIRON=local'",
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
  const wholeConfig = Object.assign(userConfig, generatorConfig);
  const formattedConfig = getFormattedConfig(wholeConfig);
  return formattedConfig;
}

function getFormattedConfig(config) {
  for (const key in config) {
    const value = config[key];
    if (fs.existsSync(value)) {
      config[key] = path.resolve(config[key]);
    } else if (typeof value == "object") {
      config[key] = getFormattedConfig(value);
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

  post.title.link = path.join("blog/", path.basename(post.file)).toString();

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
      home_path: getHomePath(environment),
      topbar: getTopBarItems(environment),
      paths: {
        layouts: layoutFilesObj,
        css: cssFiles,
        js: jsFiles,
      },
    },
  };
  return generatorConfig;
}

function getHomePath(environment) {
  const publicDirPath = getPublicDirPath(environment);
  let homePath = path.join(publicDirPath, "index.html");

  const { dir, base } = path.parse(homePath);
  const isProd = environment === "prod";
  const filename = isProd ? "/" : base;

  homePath = path.join(dir, filename);
  const homeAbsolutePath = path.resolve(homePath);
  return homeAbsolutePath;
}

function getTopBarItems(environment) {
  const publicDirPath = getPublicDirPath(environment);
  const topbar = [
    {
      item: "Resume",
      path: "resume.html",
      prod: true,
    },
    {
      item: "Projects",
      path: "projects.html",
      prod: true,
    },
    {
      item: "Blog",
      path: "blog.html",
      prod: false,
    },
    {
      item: "CV",
      path: "cv.html",
      prod: false,
    },
  ];

  const formattedPaths = topbar.map((item) => {
    const { dir, base, name } = path.parse(item.path);
    const isProd = environment === "prod";
    const filename = isProd ? name : base;

    item.path = path.join(dir, filename);
    const itemPathWithFolder = path.resolve(
      path.join(publicDirPath, item.path),
    );

    return { ...item, path: itemPathWithFolder };
  });

  return formattedPaths;
}
