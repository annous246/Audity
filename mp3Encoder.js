// src/utils/mp3Encoder.js
import {Buffer} from 'buffer';

// Small pure JS wrapper for lamejs that avoids Hermes import issues
let Lame = null;

export async function getEncoder() {
  if (!Lame) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const lame = require('lamejs'); // force require at runtime
    Lame = lame;
  }
  return new Lame.Mp3Encoder(1, 16000, 128); // mono, 16kHz, 128kbps
}

export function encodeToMp3(encoder, base64Chunk) {
  const buffer = Buffer.from(base64Chunk, 'base64');
  const samples = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / 2,
  );
  const mp3buf = encoder.encodeBuffer(samples);
  return mp3buf.length > 0 ? new Uint8Array(mp3buf) : null;
}
export function flushMp3(encoder) {
  try {
    console.log('→ Flushing MP3 encoder...');
    // Defensive: make sure encoder isn’t empty
    if (!encoder || typeof encoder.flush !== 'function') {
      console.warn('⚠️ Encoder not ready or invalid');
      return null;
    }

    const finalBuf = encoder.flush();
    console.log('✅ flush() returned', finalBuf?.length ?? 'undefined');

    if (finalBuf && finalBuf.length > 0) {
      return new Uint8Array(finalBuf);
    } else {
      console.warn('⚠️ flush() returned empty buffer');
      return null;
    }
  } catch (err) {
    console.error('💥 flush() failed:', err);
    return null;
  }
}
