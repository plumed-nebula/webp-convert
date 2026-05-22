<template>
  <div class="params-panel">
    <h3 class="panel-title">转换参数</h3>

    <div class="param-row">
      <label class="toggle-label">
        <input type="checkbox" :checked="params.lossless"
          @change="update('lossless', ($event.target as HTMLInputElement).checked)" />
        无损模式
      </label>
    </div>

    <div class="param-row" v-if="!params.lossless">
      <label>质量: {{ params.quality }}</label>
      <input type="range" min="1" max="100" :value="params.quality"
        @input="update('quality', ($event.target as HTMLInputElement).valueAsNumber)" />
    </div>

    <div class="param-row">
      <label class="toggle-label">
        <input type="checkbox" :checked="params.fps === 0"
          @change="onKeepOriginalFps($event)" />
        保持原帧率
      </label>
    </div>
    <div class="param-row" v-if="params.fps > 0">
      <label>帧率: {{ params.fps }} fps</label>
      <input type="range" min="1" max="60" :value="params.fps"
        @input="update('fps', ($event.target as HTMLInputElement).valueAsNumber)" />
    </div>

    <div class="param-row">
      <label>压缩等级: {{ params.compressionLevel }}</label>
      <input type="range" min="0" max="6" :value="params.compressionLevel"
        @input="update('compressionLevel', ($event.target as HTMLInputElement).valueAsNumber)" />
    </div>

    <div class="param-row">
      <label>循环: {{ loopLabel }}</label>
      <select :value="params.loop" @change="update('loop', Number(($event.target as HTMLSelectElement).value))">
        <option :value="0">无限循环</option>
        <option :value="1">播放一次</option>
        <option :value="3">播放 3 次</option>
      </select>
    </div>

    <div class="param-row" v-if="!params.lossless">
      <label>预设</label>
      <select :value="params.preset" @change="update('preset', ($event.target as HTMLSelectElement).value)">
        <option value="default">默认</option>
        <option value="picture">图片</option>
        <option value="photo">照片</option>
        <option value="drawing">绘画</option>
        <option value="icon">图标</option>
        <option value="text">文本</option>
      </select>
    </div>

    <div class="param-row size-row">
      <label>输出尺寸</label>
      <div class="size-inputs">
        <input type="number" :value="params.width > 0 ? params.width : ''"
          placeholder="宽度 (auto)" min="1" max="4096"
          @input="update('width', toNum(($event.target as HTMLInputElement).value))" />
        <span>&times;</span>
        <input type="number" :value="params.height > 0 ? params.height : ''"
          placeholder="高度 (auto)" min="1" max="4096"
          @input="update('height', toNum(($event.target as HTMLInputElement).value))" />
      </div>
    </div>

    <div class="param-actions">
      <button class="btn-reset" @click="$emit('reset')">恢复默认</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConvertParams } from '~/composables/useConverter'

const props = defineProps<{ params: ConvertParams }>()
const emit = defineEmits<{ update: [key: string, value: any]; reset: [] }>()

const loopLabel = computed(() => {
  if (props.params.loop === 0) return '无限'
  if (props.params.loop === 1) return '1 次'
  return `${props.params.loop} 次`
})

function update(key: string, value: any) {
  emit('update', key, value)
}

function onKeepOriginalFps(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    update('fps', 0)
  } else {
    update('fps', 15)
  }
}

function toNum(v: string): number {
  const n = parseInt(v, 10)
  return isNaN(n) || n <= 0 ? -1 : n
}
</script>

<style scoped>
.params-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}
.panel-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #1e293b;
}
.param-row {
  margin-bottom: 14px;
}
.param-row label {
  display: block;
  font-size: 13px;
  color: #475569;
  margin-bottom: 4px;
}
.param-row input[type="range"] {
  width: 100%;
  accent-color: #6366f1;
}
.param-row select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  background: #fff;
}
.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.size-inputs input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
}
.size-inputs span {
  color: #94a3b8;
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.toggle-label input[type="checkbox"] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
}
.btn-reset {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}
.btn-reset:hover {
  background: #f1f5f9;
}
.param-actions {
  margin-top: 8px;
}
</style>
