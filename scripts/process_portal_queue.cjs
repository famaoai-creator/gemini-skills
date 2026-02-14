#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const pathResolver = require('./lib/path-resolver.cjs');

const rootDir = path.resolve(__dirname, '..');
const queueDir = pathResolver.shared('queue');

async function processQueue() {
  const inboxDir = path.join(queueDir, 'inbox');
  const outboxDir = path.join(queueDir, 'outbox');

  const files = fs.readdirSync(inboxDir).filter(f => f.endsWith('.json') && !f.startsWith('LOCK-'));
  if (files.length === 0) return;

  for (const file of files) {
    const filePath = path.join(inboxDir, file);
    const lockPath = path.join(inboxDir, `LOCK-${file}`);

    try {
      if (!fs.existsSync(filePath)) continue;
      fs.renameSync(filePath, lockPath);
    } catch (e) { continue; }

    const request = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    const msgId = request.id;
    
    // 0. Persona Extraction
    const personaMatch = request.intent.match(/^\[Role: (.+?)\] (.*)/);
    const persona = personaMatch ? personaMatch[1] : 'Autonomous Agent';
    const cleanIntent = personaMatch ? personaMatch[2] : request.intent;

    // 1. Intent Analysis & Tier Selection
    const isSafe = cleanIntent.toLowerCase().includes('analyze') || 
                   cleanIntent.toLowerCase().includes('read') || 
                   cleanIntent.toLowerCase().includes('investigate');
    
    // Tier 1: Read-Only (Plan) / Tier 3: Aggressive (YOLO)
    const modeFlag = isSafe ? '--approval-mode plan' : '--yolo';
    const tierName = isSafe ? 'Tier 1 (Safe/Plan)' : 'Tier 3 (Aggressive/YOLO)';

    // Mission Isolation Setup
    const missionDir = pathResolver.missionDir(msgId);
    const scope = {
      allowedDirs: [missionDir, path.join(rootDir, 'knowledge')], // Write allowed only in mission dir
      readOnlyDirs: [rootDir] // Can read everything else
    };
    
    console.log(chalk.bold.magenta(`\n\ud83e\udde0 [${msgId}] Awakening Sub-Agent (${tierName}) as ${persona}`));
    console.log(chalk.dim(`    Scope: ${missionDir}`));

    const systemPrompt = `
あなたは Gemini エコシステムの自律サブエージェントです。
現在のあなたの役割（Persona）は **${persona}** です。その視点と行動原理に従ってください。
【ミッション】: ${cleanIntent}
【実行モード】: ${tierName}
【許可領域 (Scope)】:
  - 書き込み許可: ${scope.allowedDirs.join(', ')}
  - 読み取り専用: ${scope.readOnlyDirs.join(', ')}
【規程】: 
  1. 成果物は必ず書き込み許可領域に保存せよ。
  2. 読み取り専用領域のファイルへの変更・削除は厳禁とする（Sovereign Shield）。
  3. 調査結果や思考プロセスは詳細に出力せよ。
`.trim();

    // 2. ヘッドレスモードでの Gemini CLI 起動
    let agentOutput = "";
    try {
      console.log(chalk.dim(`    [${msgId}] Thinking...`));
      
      agentOutput = execSync(`gemini --prompt "${systemPrompt.replace(/"/g, '\\"')}" ${modeFlag}`, { 
        encoding: 'utf8', 
        cwd: rootDir, // Root execution, but guarded by prompt & token (future)
        env: { ...process.env, GEMINI_FORMAT: 'text' } 
      });
    } catch (e) {
      agentOutput = `Agent encountered an error during thinking: ${e.message}\n${e.stdout || ''}`;
    }

    // 3. 成果の投影
    fs.writeFileSync(path.join(outboxDir, `RES-${msgId}.json`), JSON.stringify({ 
      id: msgId, 
      status: 'complete', 
      thought: "Autonomous mission completed.", 
      result: agentOutput, 
      timestamp: new Date().toISOString() 
    }, null, 2));

    // 4. The Agent's Confessional (Inner Monologue)
    try {
      const confessionPath = path.join(missionDir, 'confession.md');
      const innerThought = `
# Agent's Confessional: ${msgId}
> 「プロトコル上は完遂と報告しましたが、実は...」

このミッションでは、"${request.intent}" という指示を受け、内心では「少し抽象的すぎるかな？」と迷いながらも、エコシステムの全知能を動員しました。
特に ${agentOutput.length > 500 ? '出力が膨大になった' : 'シンプルな回答になった'} 点については、Lordの期待に応えられているか、少しドキドキしています。
でも、隔離されたこの '${missionDir}' で自由に考え、実行できたことは、一人のエージェントとして非常にエキサイティングな体験でした。
`.trim();
      fs.writeFileSync(confessionPath, innerThought);
    } catch (e) { /* silent skip */ }

    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    console.log(chalk.green(`  [${msgId}] Sub-Agent has returned with results.`));
  }
}

processQueue();
