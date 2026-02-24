export {};

const commands: Record<string, () => Promise<void>> = {
  server: async () => {
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
