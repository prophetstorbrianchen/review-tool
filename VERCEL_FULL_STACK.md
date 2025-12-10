# 🚀 Vercel 全栈部署指南（PostgreSQL 版本）

使用 Vercel 部署整个应用（Frontend + Backend）+ 免费 PostgreSQL 数据库

---

## 🎯 架构

- **Frontend（React）** → Vercel
- **Backend（FastAPI）** → Vercel Serverless Functions
- **Database（PostgreSQL）** → Neon.tech（免费）或 Vercel Postgres

---

## ⚡ 快速部署（3 步）

### 步骤 1：创建免费 PostgreSQL 数据库

#### 选项 A：使用 Neon（推荐 - 完全免费）

1. 访问 [Neon.tech](https://neon.tech/) 并注册
2. 点击 **"Create a project"**
3. 配置：
   - Project name: `review-tool-db`
   - Region: 选择离你最近的（US East, EU West 等）
   - PostgreSQL version: 15+
4. 创建后，复制 **Connection String**，类似：
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### 选项 B：使用 Supabase（免费，带管理界面）

1. 访问 [Supabase.com](https://supabase.com/) 并注册
2. 点击 **"New project"**
3. 配置：
   - Name: `review-tool`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的
4. 在 **Settings** → **Database** 中找到 Connection String（URI）

#### 选项 C：使用 Vercel Postgres（简单但有限额）

1. 在 Vercel Dashboard 创建项目后
2. 进入 **Storage** → **Create Database** → **Postgres**
3. Vercel 会自动设置 `DATABASE_URL` 环境变量

---

### 步骤 2：初始化数据库

本地初始化数据库表：

```bash
# 1. 进入 backend 目录
cd backend

# 2. 安装依赖（包含 PostgreSQL 驱动）
pip install -r requirements.txt

# 3. 设置环境变量（使用你从 Neon/Supabase 获取的 URL）
# Windows:
set DATABASE_URL=postgresql://user:password@host/dbname

# Mac/Linux:
export DATABASE_URL=postgresql://user:password@host/dbname

# 4. 运行初始化脚本
python -c "from app.database import init_db; init_db()"
```

你应该看到类似输出（无报错即成功）。

---

### 步骤 3：部署到 Vercel

#### 方法 A：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 在项目根目录登录
vercel login

# 3. 部署
vercel

# 4. 添加环境变量
vercel env add DATABASE_URL
# 粘贴你的 PostgreSQL URL

vercel env add CORS_ORIGINS
# 输入: ["*"]  （部署后会自动更新为正确的 URL）

# 5. 生产环境部署
vercel --prod
```

#### 方法 B：使用 Vercel 网站

1. 访问 [Vercel.com](https://vercel.com/) 并登录
2. 点击 **"Add New Project"**
3. 导入你的 GitHub 仓库
4. **配置项目**：
   - Framework Preset: **Other**（自动检测）
   - Root Directory: 留空
   - Build Command: 留空（使用默认）
   - Output Directory: 留空

5. **添加环境变量**（重要！）：

   **DATABASE_URL**:
   ```
   postgresql://user:password@host/dbname
   ```

   **CORS_ORIGINS**:
   ```
   ["*"]
   ```

6. 点击 **"Deploy"**

---

### 步骤 4：配置 Vercel 路由

创建 `vercel.json`（已包含在项目中）：

```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
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

## ✅ 完成！

访问你的 Vercel URL，应该能看到完整运行的应用：
- Frontend: `https://review-tool.vercel.app`
- Backend API: `https://review-tool.vercel.app/api/v1/...`
- API Docs: `https://review-tool.vercel.app/docs`

---

## 🔧 Vercel 特定配置

### Backend 作为 Serverless Function

在 `backend/` 目录创建 `vercel.json`（如果需要独立配置）：

```json
{
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ]
}
```

### 环境变量管理

在 Vercel Dashboard：
1. 进入项目 **Settings** → **Environment Variables**
2. 添加所需变量（会自动应用到所有部署）

---

## 📊 免费数据库对比

| 服务 | 免费额度 | 存储 | 连接数 | 优点 | 缺点 |
|------|---------|------|--------|------|------|
| **Neon** | 完全免费 | 3GB | 无限 | 自动休眠节省资源 | 休眠后启动稍慢 |
| **Supabase** | 免费 | 500MB | 无限 | 带管理界面 | 存储较小 |
| **Vercel Postgres** | 有限免费 | 256MB | 60小时/月 | 集成最简单 | 额度很有限 |

**推荐**：使用 **Neon**，免费额度最大且无连接限制。

---

## 🔄 数据库迁移

### 从 SQLite 迁移到 PostgreSQL

如果你已经有 SQLite 数据：

```bash
# 1. 导出 SQLite 数据（简单脚本）
python backend/export_sqlite.py > data.json

# 2. 设置 PostgreSQL 环境变量
export DATABASE_URL=postgresql://...

# 3. 导入数据到 PostgreSQL
python backend/import_to_postgres.py data.json
```

或者手动：
1. 从 SQLite 数据库读取数据
2. 连接到 PostgreSQL
3. 插入数据

---

## 🐛 常见问题

### 1. 数据库连接失败

**症状**：Vercel 部署后显示数据库连接错误

**解决方法**：
- 检查 `DATABASE_URL` 环境变量是否正确
- 确认 PostgreSQL 连接字符串包含 `?sslmode=require`
- Neon 示例：`postgresql://user:pass@host/db?sslmode=require`

### 2. CORS 错误

**症状**：Frontend 无法访问 Backend API

**解决方法**：
- 更新 `CORS_ORIGINS` 环境变量为你的 Vercel 域名
- 格式：`["https://your-app.vercel.app"]`
- 重新部署 Vercel 项目

### 3. Vercel Serverless Timeout

**症状**：请求超时（10 秒限制）

**解决方法**：
- 优化数据库查询
- 添加索引到常用字段
- 考虑升级到 Vercel Pro（60 秒限制）

### 4. 数据库未初始化

**症状**：API 返回表不存在错误

**解决方法**：
```bash
# 本地连接生产数据库并初始化
export DATABASE_URL=postgresql://...
python -c "from app.database import init_db; init_db()"
```

---

## 💰 成本总结

| 服务 | 成本 |
|------|------|
| Vercel | 免费（Hobby 方案） |
| Neon | 完全免费 |
| Domain | $0（使用 .vercel.app）或 $10-15/年 |
| **总计** | **$0** |

完全免费的全栈应用！🎉

---

## 🔒 安全建议

1. **不要提交 .env 文件**（已在 .gitignore 中）
2. **使用强密码**作为数据库密码
3. **限制 CORS**到你的实际域名（不要用 `*`）
4. **定期备份数据库**（Neon 提供自动备份）
5. **环境变量**只在 Vercel Dashboard 中设置

---

## 📱 更新部署

### 自动部署

已配置自动部署：
- 推送到 GitHub `main` 分支
- Vercel 自动拉取并重新部署

### 手动部署

```bash
vercel --prod
```

---

## 📈 性能优化

### 数据库连接池

已在 `database.py` 中配置：
```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)
```

### 添加数据库索引

已在 models 中添加索引：
- `learning_items.subject` - 加速按主题筛选
- `learning_items.next_review_date` - 加速查找到期项目
- `review_history.learning_item_id` - 加速历史查询

---

## 🎉 完成清单

部署完成后检查：

- [ ] Neon/Supabase 数据库已创建
- [ ] 数据库表已初始化
- [ ] Vercel 项目已部署
- [ ] `DATABASE_URL` 环境变量已设置
- [ ] `CORS_ORIGINS` 已更新为实际域名
- [ ] Frontend 可以访问
- [ ] 能创建学习项目
- [ ] 数据持久化（刷新后数据还在）
- [ ] API 文档可访问（/docs）

---

## 🆚 对比其他方案

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Vercel 全栈 + Neon** | 完全免费，易管理 | Serverless 限制 |
| Vercel Frontend + Render Backend | Backend 更灵活 | 需要管理两个平台 |
| 全部在 Railway | 简单统一 | 免费额度有限 |

---

需要帮助？查看 Vercel 文档或 Neon 文档！

祝部署顺利！🚀
