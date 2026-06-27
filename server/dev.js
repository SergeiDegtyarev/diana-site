import { spawn } from "node:child_process";

const commands = [
  { name: "api", command: process.execPath, args: ["server/index.js"] },
  { name: "vite", command: process.platform === "win32" ? "npm.cmd" : "npm", args: ["run", "client"] },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
      children.forEach((item) => item.kill());
    }
  });

  return child;
});

const shutdown = () => {
  children.forEach((child) => child.kill());
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
