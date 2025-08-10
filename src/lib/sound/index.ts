import { readFile, BaseDirectory } from "@tauri-apps/plugin-fs";

export async function playSound(fileName: string) {
    const filePath = await readFile(`assets/${fileName}`,
        { baseDir: BaseDirectory.Resource },
    );
    const mimeType = 'audio/mpeg';
    const blob = new Blob([new Uint8Array(filePath)], { type: mimeType });
    const assetUrl = URL.createObjectURL(blob);
    const audio = new Audio(assetUrl);
    audio.play();
}
