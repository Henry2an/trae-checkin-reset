/**
 * Trae CN 签到横幅弹窗频控重置脚本
 * 作用：仅删除本地「每日签到弹窗」的展示频控记录（云端账号/积分数据完全不碰）
 * 前提：必须先完全退出 Trae CN（托盘图标也要退出），否则数据库被占用且修改会被覆盖
 * 运行：Node.js >= 22.5（node:sqlite；Node 22 下会自动以 --experimental-sqlite 重新拉起）
 */
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (Number.isNaN(nodeMajor) || nodeMajor < 22) {
  console.error('[已中止] 需要 Node.js >= 22.5。请先安装新版 Node.js（https://nodejs.org/）后重试。');
  process.exit(1);
}

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  // Node 22 需要显式开启实验性 sqlite，自动带参数重新执行本脚本
  const { spawnSync } = require('node:child_process');
  const r = spawnSync(
    process.execPath,
    ['--experimental-sqlite', __filename, ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  process.exit(r.status ?? 1);
}

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const APPDATA = process.env.APPDATA;
const GLOBAL_STORAGE = path.join(APPDATA, 'Trae CN', 'User', 'globalStorage');
const DB = path.join(GLOBAL_STORAGE, 'state.vscdb');
const LIKE = '%dailyCheckIn%';

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// 1) 检查 Trae 是否仍在运行
let taskList = '';
try {
  taskList = execSync('tasklist /FI "IMAGENAME eq Trae CN.exe" /NH', { encoding: 'utf8' });
} catch (e) {
  console.log('无法检查进程状态：', e.message);
}
if (taskList.includes('Trae CN.exe')) {
  console.error('[已中止] 检测到 Trae CN 仍在运行。请先完全退出 Trae CN（菜单 文件 → 退出，或右下角托盘图标右键退出），再运行本脚本。');
  process.exit(1);
}

// 2) 检查数据库是否存在
if (!fs.existsSync(DB)) {
  console.error('[已中止] 找不到状态数据库：', DB);
  process.exit(1);
}

// 3) 备份（含 WAL/SHM）
const backupDir = path.join(__dirname, 'backup');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = ts();
for (const suffix of ['', '-wal', '-shm']) {
  const src = DB + suffix;
  if (fs.existsSync(src)) {
    const dst = path.join(backupDir, `state.vscdb${suffix}.${stamp}.bak`);
    fs.copyFileSync(src, dst);
    console.log('已备份 ->', dst);
  }
}

// 4) 删除签到弹窗频控键
const db = new DatabaseSync(DB);
try {
  const rows = db.prepare('SELECT key, value FROM ItemTable WHERE key LIKE ?').all(LIKE);
  if (rows.length === 0) {
    console.log('没有找到签到弹窗频控记录，可能已经是干净状态，无需处理。');
  } else {
    for (const r of rows) console.log('删除前：', r.key, '=', r.value);
    const info = db.prepare('DELETE FROM ItemTable WHERE key LIKE ?').run(LIKE);
    console.log(`\n已删除 ${info.changes} 条签到弹窗频控记录。`);
  }
  const left = db.prepare('SELECT COUNT(*) AS c FROM ItemTable WHERE key LIKE ?').get(LIKE);
  console.log('校验剩余匹配记录数：', left.c);
} finally {
  db.close();
}

console.log('\n完成。现在重新打开 Trae CN，签到弹窗将按服务端配置重新具备弹出资格。');
console.log('注：若今天已在其他设备签到、或服务端活动未开启，弹窗仍不会出现（属正常）。');
