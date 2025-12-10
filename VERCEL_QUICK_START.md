# 🚀 Vercel 全栈部署 - 超快速指南

3 步完成全栈部署（Frontend + Backend + PostgreSQL）

---

## ⚡ 步骤 1：创建免费 PostgreSQL（1 分钟）

### 使用 Neon（推荐）

1. 访问 [neon.tech](https://neon.tech/) → 用 GitHub 登录
2. **Create a project** → 名称随意
3. **复制 Connection String**，类似：
   ```
   postgresql://user:xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## ⚡ 步骤 2：初始化数据库（30 秒）

```bash
# 1. 安装依赖
cd backend
pip install -r requirements.txt

# 2. 设置数据库 URL（用你复制的 Neon URL）
# Windows:
set DATABASE_URL=postgresql://user:xxx@...

# Mac/Linux:
export DATABASE_URL=postgresql://user:xxx@...

# 3. 初始化表
python -c "from app.database import init_db; init_db()"
```

看到没报错就成功了！✅

---

## ⚡ 步骤 3：部署到 Vercel（2 分钟）

### 方法 A：CLI 部署（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 回到项目根目录
cd ..

# 3. 登录
vercel login

# 4. 部署
vercel

# 添加环境变量（会提示）：
# DATABASE_URL: 粘贴你的 Neon URL
# CORS_ORIGINS: ["*"]

# 5. 生产部署
vercel --prod
```

### 方法 B：网站部署

1. 访问 [vercel.com](https://vercel.com/)
2. **Import Project** → 选择你的 GitHub 仓库
3. **Add Environment Variables**:
   - `DATABASE_URL`: 你的 Neon URL
   - `CORS_ORIGINS`: `["*"]`
4. **Deploy**

---

## ✅ 完成！

访问你的 Vercel URL，例如：
- 应用：`https://review-tool.vercel.app`
- API：`https://review-tool.vercel.app/api/v1/...`

测试：
1. ✅ 创建一个学习项目
2. ✅ 刷新页面，数据还在

---

## 🔧 部署后调整

### 更新 CORS（重要）

1. 复制你的 Vercel URL
2. 在 Vercel Dashboard → Settings → Environment Variables
3. 更新 `CORS_ORIGINS` 为：
   ```
   ["https://your-app.vercel.app"]
   ```
4. Redeploy

---

## 💡 提示

### Frontend API 配置

如果 Frontend 无法连接 Backend：

```bash
# 在 frontend/.env 添加：
VITE_API_BASE_URL=https://your-app.vercel.app/api/v1
```

然后重新部署 Frontend。

---

## 🐛 遇到问题？

### 问题 1：数据库连接失败
- 检查 `DATABASE_URL` 环境变量
- 确保包含 `?sslmode=require`

### 问题 2：API 404
- 检查 `vercel.json` 在项目根目录
- Routes 配置是否正确

### 问题 3：表不存在
- 确认步骤 2 已执行（初始化数据库）

---

## 📚 详细文档

- **完整指南**: [VERCEL_FULL_STACK.md](./VERCEL_FULL_STACK.md)
- **PostgreSQL 迁移**: [POSTGRESQL_MIGRATION.md](./POSTGRESQL_MIGRATION.md)

---

就这么简单！🎉 完全免费的全栈应用！
