import { readFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const blobCache = new Map<string, Blob>();
let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function cleanup() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeAttribute('src');
    currentAudio.load();
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export function stopSound() {
  cleanup();
}

export async function playSound(fileName: string) {
  // Stop any currently playing audio first
  cleanup();

  let blob = blobCache.get(fileName);
  if (!blob) {
    const fileData = await readFile(`assets/${fileName}`, {
      baseDir: BaseDirectory.Resource,
    });
    blob = new Blob([new Uint8Array(fileData)], { type: 'audio/mpeg' });
    blobCache.set(fileName, blob);
  }

  const assetUrl = URL.createObjectURL(blob);
  currentObjectUrl = assetUrl;

  const audio = new Audio(assetUrl);
  currentAudio = audio;

  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });

  audio.play();
}
