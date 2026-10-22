import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("\x1b[36m%s\x1b[0m", "=================================================");
console.log("\x1b[36m%s\x1b[0m", "  LeaveFlow - Starting Full-Stack Application    ");
console.log("\x1b[36m%s\x1b[0m", "=================================================");

function startProcess(name, dir, colorCode) {
  const child = spawn(npmCmd, ["run", "dev"], {
    cwd: path.join(__dirname, dir),
    shell: true,
    stdio: "pipe"
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m[${name}]\x1b[0m ${line}`);
      }
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.error(`\x1b[${colorCode}m[${name} ERR]\x1b[0m ${line}`);
      }
    }
  });

  child.on("close", (code) => {
    console.log(`\x1b[${colorCode}m[${name}]\x1b[0m Exited with code ${code}`);
  });

  return child;
}

const serverProcess = startProcess("SERVER", "server", "33"); // Yellow/amber
const clientProcess = startProcess("CLIENT", "client", "36"); // Cyan

process.on("SIGINT", () => {
  console.log("\nStopping all processes...");
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});
