<template>
  <div
    class="drop-zone"
    :class="{ dragging, hasFile: !!file }"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/gif,image/apng,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
      class="file-input"
      @change="onChange"
    />

    <template v-if="!file">
      <div class="drop-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="drop-text">拖拽文件到此处，或点击选择</p>
      <p class="drop-hint">支持 GIF / APNG / WebP / MP4 / WebM / MOV / AVI / MKV，最大 50MB</p>
    </template>

    <template v-else>
      <div class="file-info">
        <span class="file-type-badge">{{ fileType }}</span>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatSize(file.size) }}</span>
        <button class="btn-clear" @click.stop="$emit('clear')">&times;</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ file: File | null }>()
const emit = defineEmits<{ select: [file: File]; clear: [] }>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const fileType = computed(() => {
  if (!props.file) return ''
  const t = props.file.type
  if (t.startsWith('video/')) return '视频'
  if (t === 'image/gif') return 'GIF'
  if (t === 'image/apng') return 'APNG'
  if (t === 'image/webp') return 'WebP'
  return '图片'
})

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) emit('select', f)
}

function onChange() {
  const f = inputRef.value?.files?.[0]
  if (f) emit('select', f)
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}
.drop-zone:hover,
.drop-zone.dragging {
  border-color: #6366f1;
  background: #eef2ff;
}
.drop-zone.hasFile {
  border-style: solid;
  border-color: #6366f1;
  background: #eef2ff;
  padding: 16px 24px;
}
.file-input {
  display: none;
}
.drop-icon {
  color: #94a3b8;
  margin-bottom: 12px;
}
.drop-text {
  font-size: 16px;
  color: #475569;
  margin: 0 0 6px;
}
.drop-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.file-type-badge {
  background: #6366f1;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.file-name {
  font-size: 14px;
  color: #1e293b;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: 13px;
  color: #64748b;
}
.btn-clear {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.btn-clear:hover {
  color: #ef4444;
}
</style>
