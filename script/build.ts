import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // Packages with native bindings that must be external
  const nativePackages = [
    "bcrypt",
    "pg-native",
    "bufferutil",
    "utf-8-validate",
  ];

  // Node.js built-in modules that should always be external
  const builtins = [
    "fs", "path", "crypto", "http", "https", "net", "tls", "zlib",
    "stream", "util", "events", "buffer", "querystring", "url",
    "string_decoder", "punycode", "dns", "dgram", "child_process",
    "cluster", "os", "readline", "repl", "vm", "assert", "tty",
    "domain", "constants", "process", "v8", "timers", "console",
    "module", "perf_hooks", "worker_threads", "async_hooks",
  ];

  const external = [...nativePackages, ...builtins];

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "dist/index.mjs",
    banner: {
      js: `import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`,
    },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
