import { runSkillAsync } from '@agent/core';
import { logger } from '@agent/core/core';
import { safeWriteFile, safeMkdir } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkillAsync('visual-imagination', async () => {
    const args = process.argv.slice(2);
    const promptMatch = args.find(a => !a.startsWith('--'));
    const prompt = promptMatch || args[0];
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your Personal Tier.');
    }

    if (!prompt) {
      throw new Error('Prompt is required for image generation.');
    }

    const outDir = pathResolver.resolve('active/shared/imaginations');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const filename = `imagination_${Date.now()}.png`;
    const outputPath = path.join(outDir, filename);

    logger.info(`🎨 [Imagination] Constructing visual reality: "${prompt}"...`);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:predict?key=${apiKey}`;
      
      const payload = {
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/png"
        }
      };

      const response = await axios.post(url, payload);
      
      if (response.data && response.data.predictions && response.data.predictions[0]) {
        const b64Data = response.data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(b64Data, 'base64');
        
        safeWriteFile(outputPath, buffer);
        
        logger.success(`✅ Imagination materialized: ${filename}`);

        return {
          id: filename,
          path: outputPath,
          prompt
        };
      } else {
        throw new Error('Incomplete response from Gemini Image API.');
      }
    } catch (err: any) {
      logger.error(`Imagination Failure: ${err.message}`);
      throw err;
    }
  });
}
