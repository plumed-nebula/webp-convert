<template>
  <div v-if="status === 'idle'" class="preview-placeholder">
    <p>上传文件并点击"开始转换"查看结果</p>
  </div>

  <div v-else-if="status === 'converting'" class="preview-converting">
    <div class="spinner"></div>
    <p>正在转换中...</p>
  </div>

  <div v-else-if="status === 'error'" class="preview-error">
    <p>{{ error }}</p>
  </div>

  <div v-else-if="status === 'done' && resultUrl" class="preview-done">
    <div class="compare">
      <div class="compare-item">
        <h4>原文件</h4>
        <img v-if="inputPreviewUrl" :src="inputPreviewUrl" class="preview-img" />
        <p class="size-label">{{ formatSize(inputSize) }}</p>
      </div>
      <div class="compare-arrow">→</div>
      <div class="compare-item">
        <h4>WebP 输出</h4>
        <img :src="resultUrl" class="preview-img" />
        <p class="size-label">{{ formatSize(resultSize) }}</p>
      </div>
    </div>
    <div class="size-ratio" v-if="inputSize > 0">
      压缩率: {{ ((1 - resultSize / inputSize) * 100).toFixed(1) }}%
    </div>
    <button class="btn-download" @click="$emit('download')">下载 WebP</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'idle' | 'converting' | 'done' | 'error'
  resultUrl: string | null
  inputPreviewUrl: string | null
  resultSize: number
  inputSize: number
  error: string | null
}>()
defineEmits<{ download: [] }>()

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.preview-placeholder,
.preview-converting,
.preview-error {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.preview-error {
  color: #ef4444;
}
.preview-done {
  text-align: center;
}
.compare {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.compare-item {
  flex: 1;
  min-width: 160px;
  max-width: 300px;
}
.compare-item h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #64748b;
}
.compare-arrow {
  font-size: 24px;
  color: #6366f1;
  align-self: center;
  margin-top: 20px;
}
.preview-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  object-fit: contain;
  background: #f8fafc;
}
.size-label {
  font-size: 12px;
  color: #94a3b8;
  margin: 6px 0 0;
}
.size-ratio {
  margin-top: 12px;
  font-size: 14px;
  color: #22c55e;
  font-weight: 600;
}
.btn-download {
  margin-top: 16px;
  padding: 10px 28px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}
.btn-download:hover {
  background: #4f46e5;
}
</style>
