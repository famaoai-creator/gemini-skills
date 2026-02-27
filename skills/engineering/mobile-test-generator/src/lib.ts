import { safeExec } from '@agent/core/secure-io';

export interface TestGenOptions {
  appId: string;
  scenario: string;
}

export interface TestGenResult {
  appId: string;
  scenario: string;
  yamlContent: string;
}

export function generateMaestroYaml(options: TestGenOptions): string {
  const { appId, scenario } = options;

  const systemPrompt = `
あなたはモバイルテスト自動化の専門家（Rigorous Validator）です。
以下のシナリオに基づき、Maestro (https://maestro.mobile.dev/) 用のテストYAMLを生成せよ。

【App ID】: ${appId}
【シナリオ】: ${scenario}

【規程】:
1. 'appId: ${appId}' で開始せよ。
2. '---' の後にアクションを記述せよ。
3. Accessibility ID を優先したセレクタを使用せよ。
    4. 各ステップの間に必要に応じて 'assertVisible' を入れ、安定性を確保せよ。
    5. 【網羅性】単一画面だけでなく、'A -> B -> A' のような戻る遷移や、循環パスを含めた 'パス網羅 (Level 3)' を意識したステップを構成せよ。必要に応じて Maestro の '- back' コマンドを使用せよ。
    6. 生体認証（FaceID/Fingerprint/FIDO/Passkey）のステップを検知した場合、以下の手順を含めること：
       - 'Sign in with Passkey' などのボタンをタップするアクション
       - Maestro の '- authenticate' コマンドを実行
       - 認証完了後の画面遷移を 'assertVisible' で確認
    7. 出力は YAML コードのみとせよ。
    `.trim();
  try {
    // Escape prompt for shell
    const escapedPrompt = systemPrompt.replace(/"/g, '"');

    // Call gemini command using safeExec (assuming gemini is in PATH)
    // Note: This relies on the host environment having 'gemini' installed.
    // In a real agent environment, this might call an internal API instead.
    const output = safeExec('gemini', ['--prompt', escapedPrompt], {
      timeoutMs: 60000,
      // Pass through GEMINI_FORMAT env if needed, but safeExec env handling might be restricted.
      // Assuming gemini outputs text to stdout.
    });

    let yamlOutput = output;

    // Clean up code blocks if present
    const match = yamlOutput.match(/appId:[\s\S]+/);
    if (match) {
      yamlOutput = match[0].replace(/```yaml|```/g, '').trim();
    }

    return yamlOutput.trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to generate YAML: ${msg}`);
  }
}
