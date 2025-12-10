/**
 * Kill processes running on specific ports
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const os = require('os');

const PORTS = [3001, 5173]; // Backend and Frontend ports

function killPort(port) {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' }).trim();
      if (result) {
        const lines = result.split('\n');
        const pids = new Set();

        lines.forEach(line => {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) {
            pids.add(match[1]);
          }
        });

        pids.forEach(pid => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Killed process ${pid} on port ${port}`);
          } catch (e) {
            // Process might already be dead
          }
        });
      }
    } else {
      // macOS/Linux
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
      if (result) {
        const pids = result.split('\n');
        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Killed process ${pid} on port ${port}`);
          } catch (e) {
            // Process might already be dead
          }
        });
      }
    }
  } catch (error) {
    // No process found on this port, which is fine
    console.log(`  Port ${port} is already free`);
  }
}

console.log('🧹 Cleaning up ports...');
PORTS.forEach(port => killPort(port));
console.log('✅ Ports cleaned!\n');
