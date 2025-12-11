# Vercel + Railway 部署避坑指南

本文档记录了在部署 Spaced Repetition Review Tool 时遇到的所有坑和解决方案，帮助后续开发者避免重复踩坑。

## 目录

- [架构决策：为什么是 Railway + Vercel](#架构决策为什么是-railway--vercel)
- [坑 #1：Vercel 无法正常运行 FastAPI](#坑-1vercel-无法正常运行-fastapi)
- [坑 #2：Railway Root Directory 配置](#坑-2railway-root-directory-配置)
- [坑 #3：CORS 配置错误导致 OPTIONS 请求失败](#坑-3cors-配置错误导致-options-请求失败)
- [坑 #4：Vercel 前端连接不到后端 API](#坑-4vercel-前端连接不到后端-api)
- [坑 #5：Railway 环境变量配置](#坑-5railway-环境变量配置)
- [坑 #6：Vercel URL 变化问题](#坑-6vercel-url-变化问题)
- [坑 #7：数据库连接字符串配置](#坑-7数据库连接字符串配置)
- [最终正确的配置](#最终正确的配置)
- [部署检查清单](#部署检查清单)

---

## 架构决策：为什么是 Railway + Vercel

### 尝试过的方案

#### ❌ 方案 1：Vercel 全栈部署（前端 + 后端）

**尝试内容**：
- 使用 Vercel Serverless Functions 部署 FastAPI
- 尝试使用 Mangum adapter 将 ASGI 转换为 AWS Lambda handler
- 尝试自定义 ASGI handler

**遇到的问题**：
```
FUNCTION_INVOCATION_FAILED (500 错误)
- FastAPI 在 Vercel Python Serverless 中无法正常工作
- Mangum adapter 存在兼容性问题
- 自定义 ASGI handler 过于复杂且不稳定
```

**失败的提交记录**：
```bash
9a6f822 Configure Vercel serverless deployment
a73c861 Fix Vercel function runtime configuration
02a4130 Fix serverless function initialization for Vercel
f1bdb96 Add diagnostic handler to debug serverless function
8a8553b Try custom ASGI handler without Mangum
a8b3bec Restore working API handler with Mangum
```

**结论**：Vercel 不适合部署 FastAPI 应用，即使使用各种 adapter 也不稳定。

#### ✅ 方案 2：Railway（后端）+ Vercel（前端）

**优势**：
- Railway 原生支持 FastAPI/Uvicorn，无需任何 adapter
- 部署简单，配置清晰
- 性能稳定，不受 serverless 冷启动影响
- Vercel 专注前端部署，发挥其优势

**劣势**：
- 需要管理两个平台
- CORS 配置稍微复杂一点

---

## 坑 #1：Vercel 无法正常运行 FastAPI

### 问题描述

尝试在 Vercel 上使用 Python Serverless Functions 部署 FastAPI 后端。

### 错误现象

```
FUNCTION_INVOCATION_FAILED
Status: 500 Internal Server Error
```

### 尝试的解决方案（都失败了）

#### 1. 使用 Mangum Adapter

```python
# api/index.py
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
```

**问题**：
- Mangum 在 Vercel 环境中表现不稳定
- 路径解析问题
- 依赖加载失败

#### 2. 自定义 ASGI Handler

```python
# api/index.py
def handler(event, context):
    # 手动构建 ASGI scope
    scope = {
        'type': 'http',
        'asgi': {'version': '3.0'},
        'method': event.get('httpMethod'),
        'path': event.get('path'),
        # ... 更多配置
    }
    # 运行 FastAPI app
    asyncio.run(app(scope, receive, send))
```

**问题**：
- 代码过于复杂，难以维护
- 仍然存在稳定性问题
- 不同请求类型处理不一致

### 最终解决方案

**放弃在 Vercel 上部署 FastAPI，改用 Railway。**

**经验教训**：
1. ⚠️ Vercel Serverless Functions 不适合运行 FastAPI
2. ⚠️ 不要浪费时间尝试各种 adapter，直接换平台
3. ✅ Railway/Render/Fly.io 等平台原生支持 FastAPI
4. ✅ Vercel 应该专注于前端部署

---

## 坑 #2：Railway Root Directory 配置

### 问题描述

Railway 默认从仓库根目录构建，但我们的后端代码在 `backend/` 子目录中。

### 错误现象

```
Railpack could not determine how to build the app.
Build failed: No package.json, requirements.txt, or other build files found.
```

### 错误配置

```json
// railway.json 在根目录
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"  // ❌ 找不到文件
  }
}
```

### 正确解决方案

**方法 1：设置 Root Directory（推荐）**

1. 进入 Railway 项目 Settings
2. 找到 "Source" 部分
3. 设置 "Root Directory" 为 `backend`
4. 保存并重新部署

**方法 2：使用 Config as Code**

将 `railway.json` 放在 `backend/` 目录中：

```json
// backend/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

然后在 Railway Settings → Config as Code 中指定 `backend/railway.json`。

### 关键文件位置

```
backend/
├── app/                    # FastAPI 应用
├── requirements.txt        # ✅ Railway 需要找到这个
├── runtime.txt            # ✅ 指定 Python 版本
├── railway.json           # ✅ Railway 配置
└── Procfile               # 可选，railway.json 已足够
```

**经验教训**：
- ✅ 始终在 Railway 中正确设置 Root Directory
- ✅ 或将配置文件放在正确的子目录中
- ⚠️ 不要在根目录放置针对子项目的配置文件

---

## 坑 #3：CORS 配置错误导致 OPTIONS 请求失败

### 问题描述

前端从 Vercel（`https://review-tool-lac.vercel.app`）请求 Railway 后端 API 时，浏览器发送的 OPTIONS 预检请求失败。

### 错误现象

```
Access to fetch at 'https://review-tool-production.up.railway.app/api/v1/...'
from origin 'https://review-tool-lac.vercel.app' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check.

Request Method: OPTIONS
Status Code: 400 Bad Request
```

### 错误配置 #1：环境变量格式错误

```bash
# ❌ 错误：字符串格式
CORS_ORIGINS=http://localhost:3000,https://review-tool-lac.vercel.app
```

Railway 读取后，FastAPI 无法正确解析，导致 CORS 中间件失效。

### 错误配置 #2：缺少 HTTPS

```bash
# ❌ 错误：使用 HTTP 而不是 HTTPS
CORS_ORIGINS=["http://review-tool-lac.vercel.app"]
```

Vercel 部署的网站默认使用 HTTPS，必须匹配。

### 错误配置 #3：未添加实际域名

```bash
# ❌ 错误：只有本地开发环境
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

生产环境的 Vercel URL 无法访问后端。

### 正确配置

#### 1. Railway 环境变量

在 Railway → Variables 中设置：

```bash
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://review-tool-lac.vercel.app"]
```

**注意**：
- ✅ 使用 JSON 数组格式（包含方括号和引号）
- ✅ 生产环境使用 HTTPS
- ✅ 包含所有需要的域名（开发 + 生产）
- ✅ 不要添加尾部斜杠

#### 2. 后端配置代码

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
import json

class Settings(BaseSettings):
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    @property
    def cors_origins_list(self) -> list:
        """Parse CORS origins from JSON string."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            # 失败时返回默认值
            return ["http://localhost:3000", "http://localhost:5173"]
```

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # 使用解析后的列表
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 验证 CORS 配置

```bash
# 测试 OPTIONS 预检请求
curl -X OPTIONS https://review-tool-production.up.railway.app/api/v1/learning-items/ \
  -H "Origin: https://review-tool-lac.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# 期望响应头包含：
# Access-Control-Allow-Origin: https://review-tool-lac.vercel.app
# Access-Control-Allow-Methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
# Access-Control-Allow-Headers: content-type
```

**经验教训**：
- ✅ Railway 环境变量必须使用 JSON 格式配置 CORS
- ✅ 生产环境必须使用 HTTPS URL
- ✅ 部署后立即测试 CORS 配置
- ⚠️ 每次更新 Vercel URL 后都要更新 CORS 配置

---

## 坑 #4：Vercel 前端连接不到后端 API

### 问题描述

前端部署到 Vercel 后，无法连接到 Railway 后端 API。

### 错误现象

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
或
CORS policy error
```

### 错误配置：使用相对路径

```typescript
// ❌ 错误配置
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? '/api/v1'  // 这会请求 Vercel 自己的 /api/v1
  : 'http://localhost:8000/api/v1';
```

**问题**：
- 生产环境中，`/api/v1` 会请求 `https://review-tool-lac.vercel.app/api/v1`
- 但后端在 Railway 上，不在 Vercel
- 导致 404 Not Found

### 正确配置

```typescript
// frontend/src/services/api.ts

// 使用环境变量，生产环境使用 Railway 后端的完整 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://review-tool-production.up.railway.app/api/v1'  // ✅ 完整 URL
    : 'http://localhost:8000/api/v1');
```

### 配置优先级

1. **最高优先级**：环境变量 `VITE_API_BASE_URL`
   - 在 Vercel → Settings → Environment Variables 中设置
   - 便于切换不同环境

2. **次优先级**：根据构建模式硬编码
   - 生产环境：完整的 Railway URL
   - 开发环境：本地 URL

### Vercel 环境变量配置（可选但推荐）

在 Vercel → Settings → Environment Variables：

```
VITE_API_BASE_URL=https://review-tool-production.up.railway.app/api/v1
```

**好处**：
- 更容易切换后端（staging/production）
- 不需要每次修改代码
- 更安全（不在代码中硬编码 URL）

### 验证配置

```bash
# 构建前端
cd frontend
npm run build

# 检查生成的代码中的 API URL
grep -r "review-tool-production.up.railway.app" dist/
```

**经验教训**：
- ✅ 前后端分离部署时，前端必须使用后端的完整 URL
- ✅ 不要使用相对路径连接不同域名的后端
- ✅ 使用环境变量管理不同环境的 API URL
- ⚠️ Railway URL 更改后，必须更新前端配置并重新部署

---

## 坑 #5：Railway 环境变量配置

### 问题描述

Railway 环境变量配置不当导致应用运行失败或功能异常。

### 必需的环境变量

#### 1. DATABASE_URL

```bash
# ✅ 正确（PostgreSQL + SSL）
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# ❌ 错误（缺少 SSL 模式）
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname
```

**注意**：
- Neon.tech 等云数据库**必须**使用 `?sslmode=require`
- 不加此参数会导致连接失败：`SSL connection is required`

#### 2. CORS_ORIGINS

```bash
# ✅ 正确（JSON 数组格式）
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://review-tool-lac.vercel.app"]

# ❌ 错误（逗号分隔字符串）
CORS_ORIGINS=http://localhost:3000,https://review-tool-lac.vercel.app

# ❌ 错误（缺少引号）
CORS_ORIGINS=[http://localhost:3000,https://review-tool-lac.vercel.app]
```

#### 3. PORT（Railway 自动提供）

```python
# ✅ 正确：使用 Railway 提供的 $PORT 变量
uvicorn app.main:app --host 0.0.0.0 --port $PORT

# ❌ 错误：硬编码端口
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 设置环境变量的步骤

1. 进入 Railway 项目
2. 点击你的服务
3. 进入 "Variables" 标签
4. 点击 "New Variable"
5. 输入变量名和值
6. 点击 "Add"
7. Railway 会自动触发重新部署

### 验证环境变量

```bash
# 方法 1：查看 Railway 部署日志
# 在 Deployments → Deploy Logs 中查看应用启动日志

# 方法 2：添加调试端点
@app.get("/debug/env")
def debug_env():
    return {
        "database_url": settings.DATABASE_URL[:20] + "...",  # 只显示前缀
        "cors_origins": settings.cors_origins_list,
    }
```

**经验教训**：
- ✅ 数据库连接字符串必须包含 `?sslmode=require`
- ✅ CORS_ORIGINS 必须是有效的 JSON 数组字符串
- ✅ 使用 Railway 提供的 $PORT 变量
- ⚠️ 不要在日志中输出完整的敏感信息

---

## 坑 #6：Vercel URL 变化问题

### 问题描述

Vercel 为每次部署生成不同的 URL，导致 CORS 配置失效。

### Vercel URL 类型

#### 1. Preview URLs（预览 URL）

每次 git push 都会生成新的 URL：

```
https://review-tool-abc123.vercel.app  # Commit abc123
https://review-tool-def456.vercel.app  # Commit def456
https://review-tool-xyz789.vercel.app  # Commit xyz789
```

**问题**：每次推送都需要更新 Railway CORS 配置。

#### 2. Production URL（生产 URL）

固定的生产域名：

```
https://review-tool-lac.vercel.app  # 固定不变
```

**解决方案**：只在 CORS 中配置 Production URL。

### 如何确定 Production URL

1. 进入 Vercel 项目 Dashboard
2. 查看 "Production" 部署
3. 记下 Production URL
4. 在 Railway CORS 中只添加这个 URL

### 配置示例

```bash
# Railway 环境变量
# ✅ 只配置 Production URL
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://review-tool-lac.vercel.app"]

# ❌ 不要添加 Preview URLs（会不断变化）
CORS_ORIGINS=["...","https://review-tool-abc123.vercel.app"]
```

### 测试 Preview 部署

如果需要测试 Preview 部署：

**方法 1**：临时添加 Preview URL 到 CORS

```bash
# 添加当前 Preview URL 进行测试
CORS_ORIGINS=["http://localhost:3000","https://review-tool-lac.vercel.app","https://review-tool-abc123.vercel.app"]
```

**方法 2**：使用通配符（不推荐用于生产）

```python
# ⚠️ 仅用于开发/测试
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    # ...
)
```

**方法 3**：设置自定义域名

在 Vercel 中设置自定义域名，不再依赖自动生成的 URL。

**经验教训**：
- ✅ 只在生产 CORS 中配置 Vercel Production URL
- ✅ Preview URLs 不断变化，不适合加入 CORS 配置
- ✅ 考虑使用自定义域名
- ⚠️ 不要在生产环境使用 CORS 通配符

---

## 坑 #7：数据库连接字符串配置

### 问题描述

数据库连接失败，应用无法启动或运行时出错。

### 常见错误

#### 错误 #1：缺少 SSL 模式

```bash
# ❌ 错误
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname

# 错误信息
sqlalchemy.exc.OperationalError: SSL connection is required
```

**解决方案**：

```bash
# ✅ 正确
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

#### 错误 #2：密码中包含特殊字符

```bash
# ❌ 错误：密码包含 @ # 等特殊字符
DATABASE_URL=postgresql://user:p@ssw0rd#123@host.neon.tech/dbname
```

**解决方案**：URL 编码特殊字符

```python
from urllib.parse import quote_plus

password = "p@ssw0rd#123"
encoded_password = quote_plus(password)
# 结果：p%40ssw0rd%23123

# DATABASE_URL=postgresql://user:p%40ssw0rd%23123@host.neon.tech/dbname?sslmode=require
```

#### 错误 #3：本地与生产配置冲突

```python
# ❌ 错误：硬编码 SQLite
DATABASE_URL: str = "sqlite:///./data/review_tool.db"
```

**解决方案**：使用环境变量覆盖

```python
# ✅ 正确：默认 SQLite，可被环境变量覆盖
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/review_tool.db"

    class Config:
        env_file = ".env"  # 从 .env 文件读取
```

然后在 Railway 设置环境变量会自动覆盖默认值。

### Neon.tech 完整配置示例

1. **获取连接字符串**

在 Neon Dashboard → Connection Details：

```
Connection String:
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

2. **在 Railway 中配置**

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

3. **验证连接**

```python
# 添加健康检查端点
@app.get("/health/db")
def db_health_check():
    try:
        from app.database import engine
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

访问：`https://review-tool-production.up.railway.app/health/db`

**经验教训**：
- ✅ PostgreSQL 云服务必须使用 SSL
- ✅ 密码特殊字符需要 URL 编码
- ✅ 使用环境变量而不是硬编码
- ✅ 添加数据库健康检查端点
- ⚠️ 不要在日志中输出完整连接字符串

---

## 最终正确的配置

### 1. Railway 后端配置

#### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Railway 环境变量

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://review-tool-lac.vercel.app"]
```

#### Railway 设置

- **Root Directory**: `backend`
- **Config as Code**: `backend/railway.json`

### 2. Vercel 前端配置

#### vercel.json（根目录）

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

或者直接在 Vercel UI 中设置：

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Vercel 环境变量（可选）

```bash
VITE_API_BASE_URL=https://review-tool-production.up.railway.app/api/v1
```

### 3. 前端 API 配置

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://review-tool-production.up.railway.app/api/v1'
    : 'http://localhost:8000/api/v1');
```

### 4. 后端 CORS 配置

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
import json

class Settings(BaseSettings):
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    @property
    def cors_origins_list(self) -> list:
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:3000", "http://localhost:5173"]

# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 部署检查清单

### 部署前检查

- [ ] 代码已推送到 GitHub
- [ ] PostgreSQL 数据库已创建（Neon.tech）
- [ ] 获取了数据库连接字符串（包含 `?sslmode=require`）
- [ ] 确认项目结构：
  ```
  ├── backend/
  │   ├── app/
  │   ├── requirements.txt
  │   ├── railway.json
  │   └── runtime.txt
  └── frontend/
      ├── src/
      ├── package.json
      └── vite.config.ts
  ```

### Railway 部署检查

- [ ] 连接 GitHub 仓库
- [ ] 设置 Root Directory 为 `backend`
- [ ] 配置环境变量：
  - [ ] `DATABASE_URL` （包含 `?sslmode=require`）
  - [ ] `CORS_ORIGINS` （JSON 数组格式，包含 Vercel Production URL）
- [ ] 部署成功
- [ ] 获取 Railway 公开 URL
- [ ] 测试健康检查：`curl https://your-railway-url/health`
- [ ] 测试 API 文档：访问 `https://your-railway-url/docs`

### Vercel 部署检查

- [ ] 连接 GitHub 仓库
- [ ] 设置 Root Directory 为 `frontend`
- [ ] 配置构建设置：
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] 更新 API 配置指向 Railway URL
- [ ] （可选）设置环境变量 `VITE_API_BASE_URL`
- [ ] 部署成功
- [ ] 获取 Vercel Production URL

### 部署后验证

- [ ] 前端可以访问
- [ ] 打开浏览器开发者工具，检查：
  - [ ] 无 CORS 错误
  - [ ] API 请求成功（Network 标签）
  - [ ] 无 JavaScript 错误（Console 标签）
- [ ] 测试核心功能：
  - [ ] 创建学习项
  - [ ] 查看所有项目
  - [ ] 编辑项目
  - [ ] 删除项目
  - [ ] 执行复习
  - [ ] 手动复习
- [ ] 检查数据库：
  - [ ] 数据正确保存
  - [ ] 复习历史正确记录

### CORS 验证

```bash
# 测试 CORS 预检请求
curl -X OPTIONS https://your-railway-url/api/v1/learning-items/ \
  -H "Origin: https://your-vercel-url" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# 期望看到：
# Access-Control-Allow-Origin: https://your-vercel-url
# Access-Control-Allow-Methods: ...
# Access-Control-Allow-Headers: content-type
```

### 更新后重新部署

当代码更新时：

1. **后端更新**
   ```bash
   git add backend/
   git commit -m "Update backend"
   git push
   # Railway 自动部署
   ```

2. **前端更新**
   ```bash
   git add frontend/
   git commit -m "Update frontend"
   git push
   # Vercel 自动部署
   ```

3. **CORS 更新**
   - 如果 Vercel URL 变化，更新 Railway 环境变量
   - Railway 会自动重新部署

---

## 总结：关键经验

### ✅ 做的对的事

1. **放弃 Vercel 全栈部署**
   - 不要浪费时间在不适合的平台上
   - FastAPI 不适合 Vercel Serverless

2. **分离前后端部署**
   - 前端：Vercel（专业的前端平台）
   - 后端：Railway（原生支持 FastAPI）

3. **使用 JSON 格式配置 CORS**
   - 清晰、易于解析
   - 避免字符串分割的歧义

4. **完整的 URL 配置**
   - 前端使用后端的完整 URL
   - 不要使用相对路径跨域访问

5. **环境变量管理**
   - 敏感信息不硬编码
   - 便于不同环境切换

### ⚠️ 避免的错误

1. **不要尝试在 Vercel 上运行 FastAPI**
   - 即使看到教程也要谨慎
   - adapter 通常不稳定

2. **不要忽略 Root Directory 配置**
   - 单体仓库必须设置正确的子目录

3. **不要用字符串格式配置 CORS**
   - 必须使用 JSON 数组

4. **不要在生产环境使用 HTTP**
   - 始终使用 HTTPS

5. **不要忘记数据库 SSL**
   - 云数据库通常需要 `?sslmode=require`

6. **不要在 CORS 中添加 Preview URLs**
   - 只使用固定的 Production URL

---

## 附录：有用的命令

### 测试 API 端点

```bash
# 健康检查
curl https://review-tool-production.up.railway.app/health

# 获取所有学习项
curl https://review-tool-production.up.railway.app/api/v1/learning-items/

# 创建学习项
curl -X POST https://review-tool-production.up.railway.app/api/v1/learning-items/ \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","title":"Test Item","content":"Test content"}'
```

### 查看 Railway 日志

```bash
# 在 Railway Dashboard
1. 点击你的服务
2. 进入 "Deployments"
3. 选择最新部署
4. 查看 "Build Logs" 和 "Deploy Logs"
```

### 查看 Vercel 日志

```bash
# 在 Vercel Dashboard
1. 进入项目
2. 点击 "Deployments"
3. 选择部署
4. 查看 "Building" 和 "Function Logs"
```

### 本地测试

```bash
# 后端
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端
cd frontend
npm run dev
```

---

**文档版本**: 1.0
**最后更新**: 2025-12-11
**维护者**: Brian Chen

> 这份文档基于真实的部署经验编写，记录了所有踩过的坑和解决方案。
> 希望能帮助后续开发者节省时间，避免重复踩坑。

---

**生成工具**: [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
