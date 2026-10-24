import { readdir, readFile } from "node:fs/promises";
import { validateBrief } from "./schema.mjs";

const directory = new URL("../../content/daily-brief/", import.meta.url);
const files = (await readdir(directory)).filter((file) => file.endsWith(".json"));
for (const file of files) {
  validateBrief(JSON.parse(await readFile(new URL(file, directory), "utf8")), file.slice(0, -5));
}
console.log(`Validated ${files.length} Daily Brief edition(s).`);
