# 部署指南 - Vercel 部署方案

## 🎯 部署架构

- **Frontend（React）** → Vercel
- **Backend（FastAPI）** → Railway / Render / Fly.io（任选一个）

> **为什么要分开部署？**
> Vercel 的 serverless 环境不支持 SQLite 的持久化存储。Backend 需要部署到支持文件系统持久化的平台。

---

## 📦 方案 A：推荐方案（分开部署）

### 第 1 步：部署 Backend 到 Railway（推荐）

#### Railway 部署步骤：

1. **创建 Railway 账号**
   - 前往 [Railway.app](https://railway.app/)
   - 使用 GitHub 登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权并选择你的 `review-tool` 仓库
   - Railway 会自动检测到 Python 项目

3. **配置 Backend**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **添加环境变量**（在 Railway 项目设置中）
   ```
   DATABASE_URL=sqlite:///./data/review_tool.db
   CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
   ```

5. **部署**
   - Railway 会自动部署
   - 部署完成后会得到一个 URL，例如：`https://review-tool-backend.railway.app`
   - **记下这个 URL！**

---

### 第 2 步：部署 Frontend 到 Vercel

#### 2.1 准备工作

在 `frontend/.env` 中设置后端 URL（使用上面 Railway 给的 URL）：

```bash
VITE_API_BASE_URL=https://review-tool-backend.railway.app/api/v1
```

#### 2.2 Vercel 部署步骤

**方法 1：使用 Vercel CLI（推荐）**

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入 frontend 目录
cd frontend

# 3. 登录 Vercel
vercel login

# 4. 部署
vercel

# 5. 生产环境部署
vercel --prod
```

**方法 2：使用 Vercel 网站**

1. 前往 [Vercel](https://vercel.com/)
2. 使用 GitHub 登录
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **添加环境变量**：
   - 变量名：`VITE_API_BASE_URL`
   - 值：`https://review-tool-backend.railway.app/api/v1`（你的 Railway 后端 URL）

7. 点击 "Deploy"

#### 2.3 部署完成后

1. 你会得到一个 Vercel URL，例如：`https://review-tool.vercel.app`
2. **重要：回到 Railway 更新 CORS 设置**
   - 在 Railway 项目中，更新 `CORS_ORIGINS` 环境变量：
   ```
   CORS_ORIGINS=["https://review-tool.vercel.app"]
   ```
   - 重新部署 Railway 项目

---

## 🔄 方案 B：全部部署到 Vercel（需要改数据库）

如果你想全部部署到 Vercel，需要：

### 1. 改用云数据库

**推荐选项：**
- **Neon**（PostgreSQL，免费额度很大）
- **PlanetScale**（MySQL，免费额度）
- **Supabase**（PostgreSQL，免费额度）

### 2. 修改代码

需要修改以下文件：

#### 2.1 更新 `backend/requirements.txt`

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-dateutil==2.8.2
psycopg2-binary==2.9.9  # 如果使用 PostgreSQL
```

#### 2.2 更新 `backend/app/database.py`

```python
# 移除 SQLite 专用的 connect_args
engine = create_engine(
    settings.DATABASE_URL,
    # 删除这行：connect_args={"check_same_thread": False}
)
```

#### 2.3 创建 `vercel.json`（在项目根目录）

```json
{
  "builds": [
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

---

## ✅ 检查清单

### Frontend 部署前：
- [ ] 已创建 `frontend/.env` 并设置 `VITE_API_BASE_URL`
- [ ] 已创建 `frontend/vercel.json`
- [ ] 已更新 `frontend/src/services/api.ts` 使用环境变量

### Backend 部署前：
- [ ] 选择部署平台（Railway / Render / Fly.io）
- [ ] 准备环境变量配置
- [ ] 确认 CORS 设置正确

### 部署后：
- [ ] Frontend 可以访问
- [ ] Backend API 可以访问（访问 `/health` 检查）
- [ ] Frontend 能正常调用 Backend API
- [ ] CORS 配置正确（前端能成功请求后端）

---

## 🐛 常见问题

### 1. CORS 错误
**症状**：前端无法访问后端 API，浏览器控制台显示 CORS 错误

**解决方法**：
- 确认 Railway 的 `CORS_ORIGINS` 包含你的 Vercel URL
- 格式：`["https://your-app.vercel.app"]`（注意是 JSON 数组格式）

### 2. API 请求 404
**症状**：前端显示 API 请求失败

**解决方法**：
- 检查 `VITE_API_BASE_URL` 是否正确
- 确认后端已成功部署并运行
- 访问 `https://your-backend-url/health` 检查后端状态

### 3. 数据库初始化失败（Railway）
**症状**：Backend 启动失败，日志显示数据库错误

**解决方法**：
- Railway 会自动创建 `data` 目录
- 如果仍有问题，在 Railway 中添加 Volume 持久化存储

---

## 📚 其他部署平台选项

### Backend 部署平台对比：

| 平台 | 优点 | 缺点 | 免费额度 |
|------|------|------|---------|
| **Railway** | 简单易用，自动部署 | 需要绑定信用卡 | $5/月 |
| **Render** | 完全免费方案 | 冷启动较慢 | 免费 |
| **Fly.io** | 性能好 | 配置稍复杂 | 有限免费 |

---

## 🎉 完成！

部署完成后：
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- API Docs: `https://your-backend.railway.app/docs`

祝部署顺利！ 🚀
