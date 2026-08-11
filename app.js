"use strict";

const $ = (id) => document.getElementById(id);
const EXAM_DEFAULT = "2026-12-05";
const START = new Date(2026, 7, 10); // 2026-08-10 第 1 天
const LS_DONE = "sa_done_v1";
const LS_CHECK = "sa_checkins_v1";
const LS_SET = "sa_settings_v1";

const PHASES = [
  {
    name: "打底期",
    days: "第 1-30 天",
    tip: "行测模块打底 + 公专框架 + 薄弱专项",
    modules: [
      { name: "资料分析", min: 120, what: "公式+速算+限时 20 题（每天 1-2 组材料）" },
      { name: "公专", min: 90, what: "框架过一遍 + 刷 40 题 + 解析回归知识点" },
      { name: "言语理解", min: 60, what: "选词填空 + 主旨 + 语句排序（30 题）" },
      { name: "判断逻辑", min: 60, what: "削弱加强 + 翻译推理 + 相似结构 + 解释现象（30 题）" },
      { name: "数量运算", min: 40, what: "方程→排列组合→最值→行程→工程→利润（8-10 题）" },
      { name: "数推专项", min: 30, what: "多级作差→幂次→递推→分组（10 题）" },
      { name: "图推专项", min: 30, what: "立体类优先（视图/拼接/折叠）+ 规律类" },
      { name: "错题重做", min: 45, what: "间隔复习今日错题；每周日重做本周全部" },
      { name: "时政常识", min: 30, what: "全会公报 + 时政 + 常识 10 题" }
    ]
  },
  {
    name: "巩固期",
    days: "第 31-75 天",
    tip: "模块提速 + 公专真题 + 申论上手 + 科学推理补弱",
    modules: [
      { name: "资料分析", min: 100, what: "限时提速（一套材料 35 分钟内完成）" },
      { name: "公专", min: 100, what: "真题 + 错题回归知识点" },
      { name: "言语理解", min: 50, what: "30 题保持手感" },
      { name: "判断逻辑", min: 50, what: "30 题保持手感" },
      { name: "数量运算", min: 40, what: "限时（每题≤1.5 分钟）+ 错题按题型归档" },
      { name: "图推+数推", min: 30, what: "各 15 分钟保手感" },
      { name: "申论", min: 60, what: "概括 / 公文交替，每周 2 次", freq: "每周2次" },
      { name: "科学推理", min: 45, what: "物理力学/电学为主，每周 3 次", freq: "每周3次" },
      { name: "行测套题", min: 120, what: "周六全真计时 1 套", freq: "每周1次" },
      { name: "错题重做", min: 45, what: "间隔复习 + 按题型归档重做" },
      { name: "时政常识", min: 30, what: "时政 + 广东本地（大湾区/高质量发展）" }
    ]
  },
  {
    name: "套题期",
    days: "第 76-105 天",
    tip: "全真模拟为主，公专套题 + 申论强化",
    modules: [
      { name: "行测套题", min: 120, what: "隔天一套全真计时 + 复盘" },
      { name: "公专套题", min: 90, what: "整套限时 + 知识点回顾" },
      { name: "申论", min: 60, what: "每天练 1 题（格式 + 踩点）" },
      { name: "言语保持", min: 30, what: "选词 + 主旨 20 题" },
      { name: "逻辑保持", min: 30, what: "削弱加强 + 翻译 20 题" },
      { name: "图推+数推", min: 30, what: "各 15 分钟保手感" },
      { name: "错题复盘", min: 60, what: "套题错题全量复盘" },
      { name: "时政常识", min: 30, what: "时政 + 全会公报滚动背诵" }
    ]
  },
  {
    name: "冲刺期",
    days: "第 106-117 天",
    tip: "减量保状态，只复盘不学新",
    modules: [
      { name: "全真模拟", min: 120, what: "每 2-3 天一套，保持手感", freq: "每2-3天" },
      { name: "错题总复盘", min: 90, what: "只做错题，不再学新方法" },
      { name: "知识点速览", min: 60, what: "公专 + 行测核心公式速览" },
      { name: "时政背诵", min: 60, what: "全会公报 + 时政最后冲刺" },
      { name: "申论格式速览", min: 30, what: "公文格式 + 概括踩点回顾" },
      { name: "睡眠优先", min: 0, what: "睡足 8 小时，状态 > 时长", special: true }
    ]
  }
];

const ORDER = [
  { name: "资料分析", num: "20题", time: "30-32分钟", tip: "性价比之王，清醒时做；单题超 2 分钟跳过" },
  { name: "言语理解", num: "15题", time: "13-14分钟", tip: "强项，靠语感；单题 ≤50 秒" },
  { name: "判断逻辑", num: "16题", time: "13-14分钟", tip: "强项，削弱加强/翻译先做；单题 ≤55 秒" },
  { name: "图形推理", num: "4题", time: "4-5分钟", tip: "立体类先做，规律类 45 秒没思路就蒙" },
  { name: "常识+政治", num: "15题", time: "8-9分钟", tip: "会就会、不会就蒙；单题 ≤30 秒" },
  { name: "科学推理", num: "5题", time: "4-5分钟", tip: "会就做，不会快速蒙" },
  { name: "数量关系", num: "15题", time: "12-15分钟", tip: "放最后！先数推 5 题，再挑 3-5 道运算，其余蒙" }
];

/* ---------- 工具 ---------- */
function pad(n) { return String(n).padStart(2, "0"); }
function todayStr(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function parseDate(s) {
  const p = String(s).split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function readLS(key, fb) {
  try { return JSON.parse(localStorage.getItem(key)) || fb; } catch (e) { return fb; }
}
function writeLS(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
}

/* ---------- 数据 ---------- */
let settings = readLS(LS_SET, { exam: EXAM_DEFAULT });
let done = readLS(LS_DONE, {});           // date -> {module:true}
let checkins = new Set(readLS(LS_CHECK, []));

function dayIndex(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const s = new Date(START.getFullYear(), START.getMonth(), START.getDate());
  return Math.floor((d - s) / 86400000) + 1;
}
function phaseOf(now) {
  const n = dayIndex(now);
  if (n <= 30) return 0;
  if (n <= 75) return 1;
  if (n <= 105) return 2;
  return 3;
}
function dayDone(dateStr) {
  const d = done[dateStr];
  return d && Object.keys(d).some((k) => d[k]);
}
function calcStreak() {
  const d = new Date();
  if (!dayDone(todayStr(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (dayDone(todayStr(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function saveDone() { writeLS(LS_DONE, done); }
function saveCheckins() { writeLS(LS_CHECK, Array.from(checkins)); }
function saveSettings() { writeLS(LS_SET, settings); }

/* ---------- 界面 ---------- */
let toastTimer = null;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 1800);
}

function renderHead() {
  $("headDate").textContent = todayStr();
  const days = Math.max(0, Math.ceil((parseDate(settings.exam || EXAM_DEFAULT) - new Date()) / 86400000));
  $("countdownChip").textContent = "距考试 " + days + " 天";
  const lines = ["模块化备考 · 科学提分", "日拱一卒 · 功不唐捐", "刷题为主 · 复盘为王", "坚持 117 天，必上岸"];
  $("headLine").textContent = lines[new Date().getDate() % lines.length];
}

function renderToday() {
  const now = new Date();
  const pi = phaseOf(now);
  const ph = PHASES[pi];
  const key = todayStr(now);
  const d = done[key] || {};
  $("phaseName").textContent = ph.name;
  $("phaseDays").textContent = ph.days + " · " + ph.tip;

  const totalMin = ph.modules.reduce((s, m) => s + (m.min || 0), 0);
  const doneMin = ph.modules.reduce((s, m) => s + (d[m.name] ? (m.min || 0) : 0), 0);
  const pct = totalMin > 0 ? Math.min(100, Math.round(doneMin / totalMin * 100)) : 0;
  $("phaseBar").style.width = pct + "%";
  $("phaseTotal").textContent = "今日目标 " + totalMin + " 分钟 · 已完成 " + doneMin + " 分钟";
  $("doneChip").textContent = "完成 " + pct + "%";

  $("moduleList").innerHTML = ph.modules.map((m) => {
    const checked = !!d[m.name];
    return (
      '<div class="mod-item' + (checked ? " done" : "") + '">' +
      '<input type="checkbox" data-mod="' + esc(m.name) + '" ' + (checked ? "checked" : "") + ">" +
      '<div class="mod-main"><div class="mod-name">' + esc(m.name) +
      (m.freq ? ' <span class="freq">' + esc(m.freq) + "</span>" : "") +
      (m.special ? ' <span class="freq">重点</span>' : "") +
      "</div>" +
      '<div class="mod-min">' + (m.min ? m.min + " 分钟" : "—") + "</div>" +
      '<div class="mod-what">' + esc(m.what) + "</div></div></div>"
    );
  }).join("");

  renderStreak();
  renderStats();
}

function renderStreak() {
  const streak = calcStreak();
  $("streakNum").textContent = streak;
  const t = todayStr();
  if (dayDone(t)) $("streakSub").textContent = "今天已完成模块，继续保持！";
  else if (streak > 0) $("streakSub").textContent = "差一步就能续上，加油！";
  else $("streakSub").textContent = "今天还没开始，先点一个模块吧";
}

function renderStats() {
  $("statStreak").textContent = calcStreak();
  $("statTotal").textContent = checkins.size;
  const now = new Date();
  const d = done[todayStr(now)] || {};
  const min = PHASES[phaseOf(now)].modules.reduce((s, m) => s + (d[m.name] ? (m.min || 0) : 0), 0);
  $("statToday").textContent = min;
  $("examDateInput").value = settings.exam || EXAM_DEFAULT;
}

/* ---------- 计划页 ---------- */
let selPhase = phaseOf(new Date());
function renderPlan() {
  renderOrder();
  $("phasePicker").innerHTML = PHASES.map((p, i) =>
    '<button class="' + (i === selPhase ? "on" : "") + (i === phaseOf(new Date()) ? " current" : "") + '" data-phase="' + i + '">' +
    p.name + "<small>" + p.days + "</small></button>"
  ).join("");
  renderPhaseDetail();
}

function renderOrder() {
  $("orderList").innerHTML = ORDER.map((o, i) =>
    '<div class="order-row">' +
    '<span class="order-idx">' + (i + 1) + "</span>" +
    '<div class="order-main"><div class="order-name">' + esc(o.name) +
    ' <span class="order-meta">' + esc(o.num) + " · " + esc(o.time) + "</span></div>" +
    '<div class="order-tip">' + esc(o.tip) + "</div></div></div>"
  ).join("");
}
function renderPhaseDetail() {
  const p = PHASES[selPhase];
  $("phaseDetail").innerHTML =
    '<div class="card"><div class="card-title">' + esc(p.name) + " · " + esc(p.days) + "</div>" +
    '<p class="hint">' + esc(p.tip) + "</p>" +
    p.modules.map((m, i) =>
      '<div class="plan-row"><span class="plan-idx">' + (i + 1) + "</span>" +
      '<div class="plan-main"><div class="plan-name">' + esc(m.name) +
      (m.freq ? ' <span class="freq">' + esc(m.freq) + "</span>" : "") + "</div>" +
      '<div class="plan-what">' + esc(m.what) + "</div></div>" +
      '<span class="plan-min">' + (m.min ? m.min + "分" : "—") + "</span></div>"
    ).join("") +
    "</div>";
}

/* ---------- 周测分析 ---------- */
const LS_QUIZ = "sa_quiz_v1";
const QUIZ_MODULES = [
  { key: "changshi", name: "常识", target: 0.60, weight: 0.50,
    tips: ["只跟时政：全会公报 / 重要文件 / 广东本地，每天 30 分钟", "30 秒一题，不会就蒙，别恋战"] },
  { key: "yanyu", name: "言语", target: 0.80, weight: 0.80,
    tips: ["中心理解：先找主题句 / 对策句，再看选项", "逻辑填空：背高频成语表 + 语境前后呼应", "语句排序：先定首句，再验证捆绑"] },
  { key: "shuliang", name: "数量", target: 0.65, weight: 0.70,
    tips: ["数字推理：先练 多重 / 机械划分 / 递推 / 图形数阵 四类套路，每天 15 分钟", "数学运算：只练高频 6 类（工程 / 行程 / 几何 / 经济利润 / 和差倍比 / 排列组合），每题限时 1.5 分钟", "套卷里数量放最后：先数推 5 题，运算挑 3-5 道会的，其余果断蒙"] },
  { key: "panduan", name: "判断", target: 0.80, weight: 0.85,
    tips: ["图推：按 样式→属性→数量→空间 顺序扫，立体拼合 / 三视图优先", "翻译推理：把 如果那么 / 只有才 / 除非否则 公式化", "加强削弱：搭桥 / 拆桥 / 必要条件是重点，先看论点再找论据"] },
  { key: "ziliao", name: "资料", target: 0.85, weight: 1.00,
    tips: ["公式三件套：增长率 / 比重 / 平均数，每天 20 题限时", "每篇限时 7 分钟：先看题干再找数，别从头读到尾", "综合判断题用排除法，先跳过难算的选项"] }
];
function quizEntries() { return readLS(LS_QUIZ, []); }
function saveQuizEntries(arr) { writeLS(LS_QUIZ, arr); }
function weekOfQuiz(d) { return Math.floor((dayIndex(d) - 1) / 7) + 1; }

function analyzeQuiz(entry) {
  const diffF = entry.diff === "easy" ? 0.8 : entry.diff === "hard" ? 1.05 : 1;
  const rows = QUIZ_MODULES.map((m) => {
    const e = (entry.modules && entry.modules[m.key]) || {};
    const acc = e.n > 0 ? e.c / e.n : null;
    if (acc == null) return { m, acc: null, gap: 0, score: -1 };
    let score = Math.max(0, m.target - acc) * m.weight * diffF;
    if (m.key === "shuliang") score *= 1.15;              // 个人已知弱点：数量
    if (entry.diff === "easy" && acc >= m.target) score *= 0.6; // 简单卷高分打折
    return { m, acc, gap: m.target - acc, score };
  });
  const valid = rows.filter((r) => r.acc != null).sort((a, b) => b.score - a.score);
  const main = valid[0] && valid[0].score > 0.02 ? valid[0] : null;
  const assist = valid[1] && valid[1].score > 0.02 ? valid[1] : null;
  const keep = valid.filter((r) => r.acc != null && r.acc >= r.m.target).map((r) => r.m.name);
  return { rows, valid, main, assist, keep };
}

function renderQuiz() {
  const now = new Date();
  $("quizWeekLabel").textContent = "第 " + weekOfQuiz(now) + " 周";
  $("quizDateLabel").textContent = todayStr(now);
  $("quizInputs").innerHTML = QUIZ_MODULES.map((m) =>
    '<div class="quiz-row"><span>' + esc(m.name) + "</span>" +
    '<div class="quiz-nums"><input type="number" id="quizC_' + m.key + '" min="0" max="40" placeholder="答对">' +
    '<em>/</em><input type="number" id="quizN_' + m.key + '" min="0" max="40" placeholder="共题"></div></div>'
  ).join("");
  const arr = quizEntries();
  const latest = arr[arr.length - 1];
  $("quizAnalysis").innerHTML = latest ? analysisHTML(latest) :
    '<div class="empty">还没有周测记录。做完本周套卷后，把成绩填到上面保存，这里会给出本周侧重和每日 8 小时安排。</div>';
  $("quizHistory").innerHTML = historyHTML(arr);
  renderWeeklyFocus();
}

function analysisHTML(entry) {
  const a = analyzeQuiz(entry);
  const main = a.main || { m: QUIZ_MODULES[4], acc: 0, gap: 0, score: 0 };
  const assist = a.assist || { m: QUIZ_MODULES[3], acc: 0, gap: 0, score: 0 };
  const diffNote = entry.diff === "easy" ? '<div class="quiz-warn">本套卷难度偏简单：高分模块按 6 折看待，不能停练；简单卷还错的模块，说明是硬伤，优先级提高。</div>'
    : entry.diff === "hard" ? '<div class="quiz-note">本套卷偏难：分数略低属正常，重点看错题类型而不是分数。</div>' : "";
  const timeNote = (entry.unanswered || 0) > 0
    ? '<div class="quiz-warn">未答 ' + entry.unanswered + ' 题：时间分配是目前最大失分点。按 资料→言语→判断→图推→常识→科学→数量 的顺序做，数量每题超 1 分钟就跳过，先保证全部题都碰到。</div>' : "";
  const bars = a.rows.filter((r) => r.acc != null).map((r) => {
    const pct = Math.round(r.acc * 100);
    const hit = r.acc >= r.m.target;
    return '<div class="quiz-bar-row"><span class="qb-name">' + esc(r.m.name) + "</span>" +
      '<span class="qb-track"><span class="qb-fill' + (hit ? " hit" : "") + '" style="width:' + pct + '%"></span></span>' +
      '<span class="qb-pct">' + pct + "%</span></div>";
  }).join("");
  const tips = "<ul>" + (a.main ? a.main.m.tips : QUIZ_MODULES[4].tips).map((t) => "<li>" + esc(t) + "</li>").join("") +
    (a.assist ? a.assist.m.tips.slice(0, 2).map((t) => "<li>" + esc(t) + "</li>").join("") : "") + "</ul>";
  const keepNote = a.keep.length ? '<div class="quiz-note">已达目标、本周保持：' + esc(a.keep.join("、")) + "（每天 30-40 分钟保手感即可）</div>" : "";
  const blocks = dailyBlocks(main.m.name, assist.m.name);
  return (
    '<div class="card"><div class="card-title">第 ' + entry.week + " 周分析 · " + esc(entry.date) + "</div>" +
    diffNote + timeNote +
    '<div class="card-title small">各模块正确率（目标线：常识60 / 言语80 / 数量65 / 判断80 / 资料85）</div>' +
    bars +
    '<div class="card-title small">本周侧重</div>' +
    '<div class="quiz-focus"><div class="qf-main">主攻：<b>' + esc(main.m.name) + "</b>（每日约 2 小时）</div>" +
    '<div class="qf-sub">辅助：<b>' + esc(assist.m.name) + "</b>（每日约 1.5 小时）</div></div>" +
    keepNote +
    '<div class="card-title small">具体到点（主攻 + 辅助）</div>' + tips +
    '<div class="card-title small">每日 8 小时模板</div>' +
    blocks.map((b, i) => '<div class="day-block-mini"><b>' + (i + 1) + ". " + esc(b.t) + " · " + b.h + " 小时</b><div>" + esc(b.d) + "</div></div>").join("") +
    '<div class="quiz-note">方法依据：检索式刷题（测试效应）、错题归因重做（刻意练习）、上周错题间隔复习、模块交错防疲劳。文献详见"我的"页。</div>' +
    "</div>"
  );
}

function dailyBlocks(mainName, assistName) {
  return [
    { t: "主攻模块：" + mainName, h: 2, d: "检索式刷题：先做题→看解析→用一句话总结规律，比反复听课记得牢" },
    { t: "辅助模块：" + assistName, h: 1.5, d: "限时刷题，单题超时标记跳过，训练时间分配" },
    { t: "错题复盘", h: 2, d: "把当天错题按 不会 / 粗心 / 超时 归类，重做一遍，总结错误类型" },
    { t: "间隔复习", h: 1, d: "重做上周错题 + 高频考点速览（资料公式 / 数推套路 / 成语）" },
    { t: "收尾", h: 1.5, d: "套卷拆解 / 时政常识积累 / 阅读积累，保持手感" }
  ];
}

function historyHTML(arr) {
  if (!arr.length) return "";
  const rev = arr.slice().reverse();
  return '<div class="card"><div class="card-title">历史周测（近 6 周）</div>' +
    rev.slice(0, 6).map((en) => {
      let sumC = 0, sumN = 0;
      QUIZ_MODULES.forEach((m) => { const e = en.modules[m.key]; if (e && e.n > 0) { sumC += e.c; sumN += e.n; } });
      const acc = sumN > 0 ? Math.round(sumC / sumN * 100) : 0;
      const diff = en.diff === "easy" ? "简单" : en.diff === "hard" ? "偏难" : "正常";
      return '<div class="hist-row"><div class="hist-head"><b>第 ' + en.week + " 周</b> <span>" + esc(en.date) + " · " + diff + " · 总正确率 " + acc + "%</span></div>" +
        '<div class="hist-bars">' + QUIZ_MODULES.map((m) => {
          const e = en.modules[m.key];
          if (!e || e.n <= 0) return "";
          const p = Math.round(e.c / e.n * 100);
          return '<span class="hb"><i>' + esc(m.name) + "</i><b>" + p + "%</b></span>";
        }).join("") + "</div></div>";
    }).join("") + "</div>";
}

function renderWeeklyFocus() {
  const el = $("weeklyFocus");
  const arr = quizEntries();
  const latest = arr[arr.length - 1];
  if (!latest) { el.classList.add("hidden"); el.innerHTML = ""; return; }
  const a = analyzeQuiz(latest);
  const main = a.main ? a.main.m.name : "保持提速";
  el.classList.remove("hidden");
  el.innerHTML = '<div class="wf-inner">本周主攻：<b>' + esc(main) + "</b><span>（周测分析 · 第 " + latest.week + " 周）</span></div>";
}

function saveQuiz() {
  const diff = $("quizDiff").value;
  const unanswered = Math.max(0, parseInt($("quizUnanswered").value || "0", 10) || 0);
  const modules = {};
  QUIZ_MODULES.forEach((m) => {
    const c = parseInt($("quizC_" + m.key).value || "0", 10);
    const n = parseInt($("quizN_" + m.key).value || "0", 10);
    if (n > 0) modules[m.key] = { c: Math.max(0, Math.min(c, n)), n };
  });
  if (!Object.keys(modules).length) { toast("至少填一个模块的答对/共题"); return; }
  const now = new Date();
  const entry = { week: weekOfQuiz(now), date: todayStr(now), diff, unanswered, modules };
  let arr = quizEntries().filter((e) => e.week !== entry.week);
  arr.push(entry);
  saveQuizEntries(arr);
  renderQuiz();
  renderToday();
  toast("已保存第 " + entry.week + " 周分析");
}

/* ---------- 导出 / 导入 ---------- */
function exportData() {
  const data = { app: "上岸计划", exportedAt: new Date().toISOString(), settings, done, checkins: Array.from(checkins), quiz: quizEntries() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "上岸计划备份-" + todayStr() + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.settings && data.settings.exam) { settings.exam = data.settings.exam; saveSettings(); }
      if (data.done) { done = data.done; saveDone(); }
      if (Array.isArray(data.checkins)) { checkins = new Set(data.checkins); saveCheckins(); }
      if (Array.isArray(data.quiz)) saveQuizEntries(data.quiz);
      renderToday(); renderPlan(); renderQuiz(); toast("导入成功");
    } catch (e) { toast("备份文件格式不对"); }
  };
  reader.readAsText(file);
}

/* ---------- 事件 ---------- */
document.querySelectorAll("#bottomNav button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((s) => s.classList.toggle("active", s.id === "tab-" + b.dataset.tab));
    document.querySelectorAll("#bottomNav button").forEach((x) => x.classList.toggle("active", x.dataset.tab === b.dataset.tab));
    if (b.dataset.tab === "plan") renderPlan();
    if (b.dataset.tab === "quiz") renderQuiz();
    if (b.dataset.tab === "me") renderStats();
  })
);

document.addEventListener("change", (e) => {
  if (e.target.matches("input[data-mod]")) {
    const key = todayStr();
    if (!done[key]) done[key] = {};
    done[key][e.target.dataset.mod] = e.target.checked;
    if (!checkins.has(key)) { checkins.add(key); saveCheckins(); }
    saveDone();
    renderToday();
    toast(e.target.checked ? "打卡成功" : "已取消");
  }
});

document.addEventListener("click", (e) => {
  const ph = e.target.closest("[data-phase]");
  if (ph) { selPhase = parseInt(ph.dataset.phase, 10); renderPlan(); return; }
  if (e.target.matches("#quizSaveBtn")) saveQuiz();
  if (e.target.matches("#examDateSave")) {
    const v = $("examDateInput").value;
    if (v) { settings.exam = v; saveSettings(); renderHead(); toast("考试日期已更新"); }
  }
  if (e.target.matches("#exportBtn")) exportData();
  if (e.target.matches("#clearDataBtn")) {
    if (!confirm("确定清空全部打卡记录吗？")) return;
    done = {}; checkins = new Set();
    saveDone(); saveCheckins();
    renderToday(); renderPlan(); toast("已清空");
  }
});
$("importFile").addEventListener("change", (e) => {
  if (e.target.files[0]) importData(e.target.files[0]);
  e.target.value = "";
});

/* ---------- 启动 ---------- */
renderHead();
renderToday();
renderPlan();
renderQuiz();
renderStats();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
