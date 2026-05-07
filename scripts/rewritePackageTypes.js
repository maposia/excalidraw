const fs = require("fs");
const path = require("path");

const packageDir = process.cwd();
const packageJsonPath = path.join(packageDir, "package.json");
const distTypesDir = path.join(packageDir, "dist/types");

if (!fs.existsSync(packageJsonPath)) {
  throw new Error(`package.json not found in ${packageDir}`);
}

if (!fs.existsSync(distTypesDir)) {
  throw new Error(`dist/types not found in ${packageDir}`);
}

const { name: packageName } = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
);

if (!packageName) {
  throw new Error(`Package name is missing in ${packageJsonPath}`);
}

const replacements = [
  [/@excalidraw\/excalidraw(?=\/|")/g, packageName],
  [/@excalidraw\/common(?=\/|")/g, `${packageName}/common`],
  [/@excalidraw\/element(?=\/|")/g, `${packageName}/element`],
  [/@excalidraw\/math(?=\/|")/g, `${packageName}/math`],
  [/@excalidraw\/utils(?=\/|")/g, `${packageName}/utils`],
];

const rewriteFile = (filePath) => {
  const original = fs.readFileSync(filePath, "utf8");
  const rewritten = replacements.reduce(
    (contents, [pattern, replacement]) =>
      contents.replace(pattern, replacement),
    original,
  );

  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten);
  }
};

const walk = (dirPath) => {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      rewriteFile(entryPath);
    }
  }
};

walk(distTypesDir);
