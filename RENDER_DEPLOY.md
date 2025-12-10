# 🆓 Render 免费部署完整指南

Render 提供完全免费的部署方案，非常适合个人项目！

---

## ⚠️ Render 免费方案的限制

了解这些限制很重要：

1. **冷启动**：15 分钟不活动后服务会休眠，下次访问需要 30-60 秒启动
2. **每月构建时间**：免费方案有限制（通常足够个人使用）
3. **自动休眠**：可以使用 cron-job.org 等服务定期 ping 保持唤醒
4. **数据持久化**：需要配置 Disk（已在配置中设置好）

**优点**：完全免费，无需信用卡，数据持久化！

---

## 🚀 部署步骤（详细版）

### 步骤 1：准备代码

确保你的代码已推送到 GitHub：

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

### 步骤 2：部署 Backend 到 Render

#### 2.1 创建 Web Service

1. **访问** [Render.com](https://render.com/) 并注册/登录（可以用 GitHub 登录）

2. **点击** "New +" → "Web Service"

3. **连接 GitHub**：
   - 授权 Render 访问你的 GitHub
   - 选择 `review-tool` 仓库

4. **配置服务**：

   **Basic Settings:**
   - **Name**: `review-tool-backend`（或你喜欢的名称）
   - **Region**: 选择 `Oregon (US West)` 或其他免费区域
   - **Branch**: `main`
   - **Root Directory**: `backend`（重要！）
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

   **Instance Type:**
   - 选择 **Free** 方案

#### 2.2 添加环境变量

在 "Environment" 部分，点击 "Add Environment Variable"，添加以下变量：

```
DATABASE_URL=sqlite:////opt/render/project/src/data/review_tool.db
CORS_ORIGINS=["*"]
```

**注意**：暂时使用 `["*"]` 允许所有来源，部署完 Frontend 后再更新为具体的 Vercel URL。

#### 2.3 添加持久化磁盘（重要！）

1. 在配置页面找到 **"Disks"** 部分
2. 点击 **"Add Disk"**
3. 配置：
   - **Name**: `review-tool-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: `1 GB`（免费方案最大值）

4. **保存配置**

#### 2.4 开始部署

1. 点击 **"Create Web Service"**
2. Render 会开始构建和部署（大约 3-5 分钟）
3. 查看日志确认部署成功
4. 部署完成后，你会得到一个 URL，例如：
   ```
   https://review-tool-backend.onrender.com
   ```
5. **测试**：访问 `https://review-tool-backend.onrender.com/health`，应该返回 `{"status":"healthy"}`

---

### 步骤 3：部署 Frontend 到 Vercel

#### 3.1 配置环境变量

在本地 `frontend/.env` 文件中设置：

```env
VITE_API_BASE_URL=https://review-tool-backend.onrender.com/api/v1
```

**重要**：将上面的 URL 改成你在步骤 2.4 得到的实际 Render URL！

#### 3.2 部署到 Vercel

**方法 A：使用 Vercel CLI**

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 进入 frontend 目录
cd frontend

# 3. 登录 Vercel
vercel login

# 4. 部署
vercel

# 按照提示操作，然后部署到生产环境
vercel --prod
```

**方法 B：使用 Vercel 网站**

1. 访问 [Vercel.com](https://vercel.com/) 并登录
2. 点击 **"Add New Project"**
3. 选择你的 GitHub 仓库
4. **配置项目**：
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **添加环境变量**：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://review-tool-backend.onrender.com/api/v1`
   （改成你的 Render URL）

6. 点击 **"Deploy"**

7. 部署完成后，你会得到一个 URL，例如：
   ```
   https://review-tool.vercel.app
   ```

---

### 步骤 4：更新 CORS 设置

1. 复制你的 Vercel URL
2. 回到 **Render Dashboard**
3. 找到你的 `review-tool-backend` 服务
4. 进入 **"Environment"** 标签
5. 更新 `CORS_ORIGINS` 变量：
   ```
   CORS_ORIGINS=["https://review-tool.vercel.app"]
   ```
   （改成你的实际 Vercel URL）

6. 保存后，Render 会自动重新部署（大约 2-3 分钟）

---

## ✅ 完成！测试你的应用

访问你的 Vercel URL（`https://review-tool.vercel.app`），应该能看到：

1. ✅ 主页正常加载
2. ✅ 可以创建学习项目
3. ✅ 数据能够保存（刷新页面后数据还在）
4. ✅ 所有功能正常运行

---

## 🔧 Render 特定配置说明

### 使用 render.yaml 自动部署（推荐）

我已经为你准备好了 `backend/render.yaml` 文件，它包含了所有配置。

**好处**：
- 配置版本控制
- 一键部署
- 自动配置持久化磁盘

**使用方法**：
1. 在 Render 创建服务时，选择 "New +" → "Blueprint"
2. 连接你的 GitHub 仓库
3. Render 会自动读取 `render.yaml` 并配置一切
4. 只需要在 Environment Variables 中更新 `CORS_ORIGINS`

### 持久化存储说明

配置中的这部分很重要：

```yaml
disk:
  name: review-tool-data
  mountPath: /opt/render/project/src/data
  sizeGB: 1
```

- **name**: 磁盘的名称（唯一标识）
- **mountPath**: 数据库文件存储的路径（必须与 DATABASE_URL 匹配）
- **sizeGB**: 免费方案最大 1GB

**重要**：删除服务会同时删除磁盘数据！如果要保留数据，需要先备份。

---

## 🐛 常见问题

### 1. 服务休眠/冷启动

**症状**：第一次访问很慢（30-60 秒）

**原因**：Render 免费服务 15 分钟不活动后会休眠

**解决方法**：
- **方法 A**：使用 [cron-job.org](https://cron-job.org) 每 10 分钟 ping 一次你的 `/health` 端点
- **方法 B**：升级到付费方案（$7/月）
- **方法 C**：接受冷启动（对个人项目来说通常可以接受）

设置 cron-job 保持唤醒：
1. 访问 [cron-job.org](https://cron-job.org) 并注册
2. 创建新任务：
   - URL: `https://review-tool-backend.onrender.com/health`
   - Interval: 每 10 分钟
3. 保存并启用

### 2. CORS 错误

**症状**：前端无法连接后端，浏览器控制台显示 CORS 错误

**解决方法**：
1. 检查 Render 的 `CORS_ORIGINS` 环境变量
2. 确保格式正确：`["https://your-app.vercel.app"]`
3. 注意是 JSON 数组格式，需要双引号
4. 确保 URL 没有尾部斜杠

### 3. 数据丢失

**症状**：重启后数据消失

**原因**：可能没有正确配置持久化磁盘

**解决方法**：
1. 确认 Render Dashboard 中 "Disks" 部分有配置
2. 检查 Mount Path 是否正确：`/opt/render/project/src/data`
3. 确认 `DATABASE_URL` 使用了正确的路径：`sqlite:////opt/render/project/src/data/review_tool.db`
4. 注意是 **4 个斜杠**：`sqlite:///` + `/opt/...`

### 4. 构建失败

**症状**：部署时构建失败

**常见原因和解决方法**：
- **Python 版本**：确保 `runtime.txt` 指定了正确的版本（3.9.18）
- **依赖问题**：检查 `requirements.txt` 是否正确
- **Root Directory**：确保设置为 `backend`

### 5. 启动失败

**症状**：构建成功但服务无法启动

**检查**：
1. 查看 Render 日志（Logs 标签）
2. 确认 Start Command 正确：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. 确认 `$PORT` 变量（Render 自动提供）

---

## 📊 监控和日志

### 查看日志

1. 进入 Render Dashboard
2. 选择你的服务
3. 点击 **"Logs"** 标签
4. 实时查看应用日志

### 常用日志命令

在日志中搜索：
- 错误：搜索 `ERROR`
- 启动：搜索 `Uvicorn running`
- 数据库：搜索 `database`

---

## 💰 成本对比

| 功能 | 免费方案 | 付费方案 ($7/月) |
|------|---------|-----------------|
| 冷启动 | ✅ 有（15分钟后休眠） | ❌ 无，永久运行 |
| 持久化存储 | ✅ 1GB | ✅ 更大容量 |
| 构建时间 | ✅ 有限制 | ✅ 更多 |
| 自定义域名 | ✅ 支持 | ✅ 支持 |
| SSL | ✅ 自动 | ✅ 自动 |

**建议**：先用免费方案试试，如果冷启动让你困扰再考虑升级。

---

## 🔄 更新部署

### 自动部署

Render 默认启用自动部署：
- 每次推送到 GitHub 的 `main` 分支
- Render 会自动拉取最新代码并重新部署

### 手动部署

如果需要手动触发：
1. 进入 Render Dashboard
2. 选择你的服务
3. 点击 **"Manual Deploy"** → "Deploy latest commit"

---

## 📱 添加自定义域名（可选）

Render 免费方案支持自定义域名！

1. 在 Render Dashboard 选择你的服务
2. 进入 **"Settings"** → "Custom Domains"
3. 点击 **"Add Custom Domain"**
4. 按照说明配置 DNS（通常是添加 CNAME 记录）
5. SSL 证书会自动配置

---

## 🎉 完成清单

部署完成后检查：

- [ ] Backend 在 Render 上运行正常
- [ ] 访问 `/health` 返回成功
- [ ] 访问 `/docs` 能看到 API 文档
- [ ] Frontend 在 Vercel 上运行正常
- [ ] 能创建学习项目
- [ ] 数据持久化（刷新后数据还在）
- [ ] CORS 配置正确（无控制台错误）
- [ ] （可选）设置了 cron-job 防止休眠

---

## 📞 需要帮助？

- **Render 文档**：https://render.com/docs
- **Vercel 文档**：https://vercel.com/docs
- **项目问题**：检查 GitHub Issues

祝部署顺利！🚀
