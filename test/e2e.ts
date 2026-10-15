import test, { after, before, suite } from "node:test";
import assert from "node:assert";
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import bundle from "../../../core/internal/bundle/lib/bundle/index.ts";
import { cleanup, cli, sample, sassBuilder } from "./common.ts";

suite("sass plugin - e2e", () => {
    before(cleanup);
    after(cleanup);

    // the plugin's output must be the sass CLI's, byte for byte
    test("same output as the sass cli", async () => {
        child_process.execFileSync(
            process.execPath,
            [
                cli("sass", "sass"),
                "style.scss",
                "output.css",
                "--no-source-map"
            ],
            { stdio: "ignore", cwd: sample }
        );

        const builder = await sassBuilder();
        const result = await bundle.bundle(path.join(sample, "index.ts"));
        builder.end();

        assert.deepEqual(result.Errors, null);
        assert.deepEqual(result.Warnings, null);
        assert.deepEqual(
            result.OutputFiles,
            ["index.ts.js", "style.scss.css", "index.html"].map((file) =>
                path.join(sample, "out", file)
            )
        );
        assert.deepEqual(
            fs.readFileSync(path.join(sample, "out", "style.scss.css")),
            fs.readFileSync(path.join(sample, "output.css"))
        );
    });
});
