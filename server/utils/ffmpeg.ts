import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises'

const ffmpegPath: string =
  typeof ffmpegStatic === 'string'
    ? ffmpegStatic
    : ((ffmpegStatic as unknown as Record<string, unknown> | null)?.default as string) ?? ''
ffmpeg.setFfmpegPath(ffmpegPath)

export interface ConvertParams {
  quality: number
  fps: number
  lossless: boolean
  width: number
  height: number
  loop: number
  compressionLevel: number
  preset: 'default' | 'picture' | 'photo' | 'drawing' | 'icon' | 'text'
}

export async function runConvert(
  inputBuffer: Buffer,
  inputExt: string,
  params: ConvertParams,
  timeoutMs = 60000,
): Promise<Buffer> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'webp-'))
  const inputPath = join(tmpDir, `input.${inputExt}`)
  const outputPath = join(tmpDir, 'output.webp')

  try {
    await writeFile(inputPath, inputBuffer)

    const command = ffmpeg(inputPath)
    command.videoCodec('libwebp_anim')
    command.addOutputOptions([
      `-lossless ${params.lossless ? 1 : 0}`,
      `-q:v ${params.quality}`,
      `-compression_level ${params.compressionLevel}`,
      `-loop ${params.loop}`,
      `-preset ${params.preset}`,
      '-an',
      '-vsync 0',
    ])

    const vfParts: string[] = []
    if (params.fps > 0) {
      vfParts.push(`fps=${params.fps}`)
    }
    if (params.width > 0 || params.height > 0) {
      const w = params.width > 0 ? params.width : -1
      const h = params.height > 0 ? params.height : -1
      vfParts.push(`scale=${w}:${h}`)
    }
    if (vfParts.length > 0) {
      command.videoFilters(vfParts.join(','))
    }

    command.save(outputPath)

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        command.kill('SIGKILL')
        reject(new Error('转换超时'))
      }, timeoutMs)

      command
        .on('end', () => {
          clearTimeout(timer)
          resolve()
        })
        .on('error', (err: Error) => {
          clearTimeout(timer)
          reject(err)
        })
    })

    return await readFile(outputPath)
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
