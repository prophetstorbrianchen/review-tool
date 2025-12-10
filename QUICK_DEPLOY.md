# 🚀 快速部署指南

## 📋 部署前准备

你需要：
1. GitHub 账号
2. Vercel 账号（免费）
3. Railway 账号（推荐）或 Render 账号（免费）

---

## ⚡ 3 步快速部署

### 步骤 1：推送代码到 GitHub

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/review-tool.git
git push -u origin main
```

---

### 步骤 2：部署 Backend 到 Railway

1. **访问** [Railway.app](https://railway.app/) 并登录
2. **点击** "New Project" → "Deploy from GitHub repo"
3. **选择** 你的 `review-tool` 仓库
4. **配置**：
   - Root Directory: `backend`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **添加环境变量**（在 Settings → Variables）：
   ```
   DATABASE_URL=sqlite:///./data/review_tool.db
   CORS_ORIGINS=["*"]
   ```

6. **部署完成**后，复制你的 Railway URL（例如：`https://review-tool-production.up.railway.app`）

---

### 步骤 3：部署 Frontend 到 Vercel

#### 方法 A：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入 frontend 目录
cd frontend

# 3. 设置后端 URL
# 编辑 .env 文件，将 VITE_API_BASE_URL 改成你的 Railway URL
echo "VITE_API_BASE_URL=https://review-tool-production.up.railway.app/api/v1" > .env

# 4. 部署到 Vercel
vercel --prod
```

#### 方法 B：使用 Vercel 网站

1. **访问** [Vercel.com](https://vercel.com/) 并登录
2. **点击** "Add New Project"
3. **导入** 你的 GitHub 仓库
4. **配置项目**：
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **添加环境变量**：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://review-tool-production.up.railway.app/api/v1`
   （改成你的 Railway URL）

6. **点击** "Deploy"

---

### 步骤 4：更新 CORS 设置

1. 复制你的 Vercel URL（例如：`https://review-tool.vercel.app`）
2. 回到 **Railway**
3. 在 **Variables** 中更新 `CORS_ORIGINS`：
   ```
   CORS_ORIGINS=["https://review-tool.vercel.app"]
   ```
4. Railway 会自动重新部署

---

## ✅ 完成！

现在访问你的 Vercel URL，应该就可以看到完整运行的应用了！

- **前端**：`https://review-tool.vercel.app`
- **后端**：`https://review-tool-production.up.railway.app`
- **API 文档**：`https://review-tool-production.up.railway.app/docs`

---

## 🐛 遇到问题？

### CORS 错误
- 确认 Railway 的 `CORS_ORIGINS` 包含你的 Vercel URL
- 格式必须是：`["https://your-app.vercel.app"]`

### API 连接失败
- 检查 Frontend `.env` 中的 `VITE_API_BASE_URL` 是否正确
- 确认 Backend 在 Railway 上正常运行（访问 `/health` 端点）

### 数据库错误
- Railway 会自动创建持久化存储
- 如果仍有问题，在 Railway 项目中添加 Volume

---

## 📚 详细文档

查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解更多部署选项和详细说明。
