import { defineConfig } from "tsup";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import plugin from "node-stdlib-browser/helpers/esbuild/plugin";
import stdLibBrowser from "node-stdlib-browser";

export default defineConfig([
    {
        name: "browser",
        entry: ["src/index.ts"],
        sourcemap: true,
        platform: "browser",
        clean: true,
        minify: true,
        shims: true,
        treeshake: true,
        globalName: "Dev3SDK",
        format: ["cjs", "esm"],
        noExternal: ["cbor"],
        inject: ["node_modules/node-stdlib-browser/helpers/esbuild/shim.js"],
        esbuildPlugins: [NodeModulesPolyfillPlugin(), plugin(stdLibBrowser)],
        outDir: "dist/browser"
    },
    {
        name: "node",
        entry: ["src/index.ts"],
        sourcemap: true,
        platform: "node",
        clean: true,
        minify: true,
        shims: true,
        treeshake: true,
        globalName: "Dev3SDK",
        format: ["cjs", "esm"],
        outDir: "dist/node"
    }
]);
