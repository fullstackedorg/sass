import test, { afterEach, before, suite } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { type Browser, createBrowser } from "../../../test/browser.ts";
import bundle from "../../../core/internal/bundle/lib/bundle/index.ts";
import { cleanup, sample } from "./common.ts";

suite("sass plugin - integration", () => {
    let browser: Browser;

    before(cleanup);
    afterEach(async () => {
        await browser?.end();
        cleanup();
    });

    // the plugin running in the webview, bundling a project there
    test("bundled in the webview", async () => {
        const build = path.join(sample, "build");
        await bundle.bundle(path.join(build, "index.ts"));
        browser = await createBrowser(build);

        const page = await browser.createPage();
        await page.page.waitForFunction(
            'document.body.classList.contains("done")'
        );
        assert.deepEqual(
            await page.getPixelColorRGB({ x: 0, y: 0 }),
            [0, 255, 0]
        );
        await page.page.close();
    });
});
