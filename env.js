const PROD_PUBLIC_DIR = "./public";
const LOCAL_PUBLIC_DIR = "./_public";

function getEnvironmentSetup() {
  const environment = process.env.ENVIRON;
  if (environment === undefined) {
    throw new Error(
      "Consider setting an environment variable, such as 'ENVIRON=prod' or 'ENVIRON=debug'"
    );
  }
  if (environment !== "prod" && environment !== "debug") {
    throw new Error(`Invalid value for ENVIRON variable: '${environment}'`);
  }
  return environment;
}

const environment = getEnvironmentSetup();
const publicDirPath =
  environment === "prod" ? PROD_PUBLIC_DIR : LOCAL_PUBLIC_DIR;

export const ENVIRONMENT = environment;
export const PUBLIC_DIR_PATH = publicDirPath;
