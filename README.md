# WebP 转换器

上传动图 / 视频，后端用 ffmpeg 转为 Animated WebP 后返回。

## 快速开始

```bash
npm install          # 自动从 example-config.ts 创建 config.ts（如不存在）
npm run dev          # 开发模式 http://localhost:3000
```

首次运行前编辑 `config.ts` 修改密钥和参数：

```ts
export default {
  enableAuth: true,           // 是否启用密钥验证
  secretKey: 'your-key',      // 访问密钥（务必修改）
  maxFileSize: 50 * 1024 * 1024,  // 上传大小限制（字节）
  ffmpegTimeout: 60000,       // 转换超时（毫秒）
  port: 3000,                 // 端口
}
```

`config.ts` 不纳入版本管理，修改不会污染 git 状态。

## 生产部署

```bash
# 1. 安装依赖并创建配置
npm install --omit=dev
cp example-config.ts config.ts
# 编辑 config.ts，设置密钥和参数

# 2. 构建
npm run build

# 3. 启动
node .output/server/index.mjs
```

构建产物在 `.output/`，部署时需保留 `node_modules/`（ffmpeg-static 需要其中的 ffmpeg 二进制文件）。

### 环境变量（可选）

也可通过环境变量覆盖端口：

```bash
PORT=8080 node .output/server/index.mjs
```

### systemd 示例

```
[Unit]
Description=WebP Converter
After=network.target

[Service]
Type=simple
User=www
WorkingDirectory=/opt/webp-convert
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Docker 部署

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY . .
RUN npm install --omit=dev && npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```
