# 🚀 Render 快速开始（3 步搞定）

完全免费部署，无需信用卡！

---

## 📋 开始前

确保代码已推送到 GitHub：
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## ⚡ 3 步部署

### 步骤 1️⃣：部署 Backend 到 Render

1. 访问 [render.com](https://render.com)，用 GitHub 登录
2. 点击 **"New +"** → **"Web Service"**
3. 选择你的 `review-tool` 仓库
4. **重要配置**：
   ```
   Name: review-tool-backend
   Region: Oregon (US West)
   Root Directory: backend  ⚠️ 重要！
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

5. **添加环境变量**（在 Environment 部分）：
   ```
   DATABASE_URL=sqlite:////opt/render/project/src/data/review_tool.db
   CORS_ORIGINS=["*"]
   ```

6. **添加持久化磁盘**（在 Disks 部分点击 "Add Disk"）：
   ```
   Name: review-tool-data
   Mount Path: /opt/render/project/src/data
   Size: 1 GB
   ```

7. 点击 **"Create Web Service"** 并等待部署完成（3-5 分钟）

8. **记下你的 URL**：例如 `https://review-tool-backend.onrender.com`

---

### 步骤 2️⃣：部署 Frontend 到 Vercel

```bash
# 1. 进入 frontend 目录
cd frontend

# 2. 更新 .env 文件（使用你在步骤 1 得到的 Render URL）
echo "VITE_API_BASE_URL=https://review-tool-backend.onrender.com/api/v1" > .env

# 3. 安装 Vercel CLI
npm install -g vercel

# 4. 部署
vercel --prod
```

按照提示操作，需要添加环境变量：
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://review-tool-backend.onrender.com/api/v1`

**记下你的 Vercel URL**：例如 `https://review-tool.vercel.app`

---

### 步骤 3️⃣：更新 CORS 设置

1. 回到 [Render Dashboard](https://dashboard.render.com)
2. 选择你的 `review-tool-backend` 服务
3. 进入 **"Environment"** 标签
4. 找到 `CORS_ORIGINS`，点击编辑
5. 改成你的 Vercel URL：
   ```
   ["https://review-tool.vercel.app"]
   ```
6. 保存（会自动重新部署，等待 2-3 分钟）

---

## ✅ 完成！

访问你的 Vercel URL，应该能看到完整运行的应用了！

**测试**：
- ✅ 创建一个学习项目
- ✅ 刷新页面，数据还在（证明持久化成功）
- ✅ 所有功能正常

---

## ⚠️ 重要提示

### 冷启动问题
Render 免费服务 15 分钟不活动会休眠，下次访问需要 30-60 秒启动。

**解决方法**：设置定时 ping
1. 访问 [cron-job.org](https://cron-job.org)
2. 创建任务 ping `https://review-tool-backend.onrender.com/health`
3. 设置间隔：每 10 分钟
4. 启用任务

这样服务就不会休眠了！

---

## 🐛 遇到问题？

### CORS 错误
- 确认 `CORS_ORIGINS` 格式：`["https://your-app.vercel.app"]`
- 注意是 JSON 数组，需要双引号

### 数据丢失
- 确认 Render Dashboard 的 "Disks" 部分有配置
- Mount Path 必须是：`/opt/render/project/src/data`

### 详细指南
查看 [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) 获取完整文档。

---

完成！享受你的免费应用吧！🎉
