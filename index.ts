import fs from "fs";
import path from "path";
import * as sass from "sass";

export async function sassBuilder(params: {
    resolved: {
        path: string;
        resolvedDir: string;
    }[];
}) {
    const entry = path.join(
        params.resolved.at(0).resolvedDir,
        params.resolved.at(0).path
    );
    const contents = await fs.promises.readFile(entry, "utf-8");
    const result = await sass.compileStringAsync(contents, {
        importer: {
            canonicalize(url, context) {
                const containingDir = path.dirname(
                    context.containingUrl?.pathname || entry
                );
                const filePath = path.join(containingDir, url);
                return new URL("file:///" + filePath);
            },
            async load(url) {
                const contents = await fs.promises.readFile(
                    url.pathname.slice(1),
                    "utf-8"
                );
                return {
                    contents: contents,
                    syntax: url.pathname.endsWith(".sass") ? "indented" : "scss"
                };
            }
        }
    });
    const basename = path.basename(params.resolved.at(0).path);
    return [
        {
            outputName: basename + ".css",
            contents: result.css + "\n"
        }
    ];
}

const pluginSass = {
    data: {
        name: "sass",
        filter: "\\.(sass|scss)$"
    },
    callback: sassBuilder
};

export default pluginSass;
