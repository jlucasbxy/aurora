export {};

const commands: Record<string, () => Promise<void>> = {
  "server:dev": async () => {
    process.env.NODE_ENV ??= "development";
    const { start } = await import("@/main/server");
    await start();
  },
  "server:prod": async () => {
    process.env.NODE_ENV ??= "production";
    const { start } = await import("@/main/server");
    await start();
  },
  server: async () => {
    process.env.NODE_ENV ??= "production";
    const { start } = await import("@/main/server");
    await start();
  }
};

const mode = process.argv[2];
const run = commands[mode];

if (run) {
  await run();
} else {
  const available = Object.keys(commands).join("|");
  process.stderr.write(`Usage: ${process.argv[1]} <${available}>\n`);
  process.exit(1);
}
