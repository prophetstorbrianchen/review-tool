# 📊 PostgreSQL 迁移指南

本项目已从 SQLite 迁移到支持 PostgreSQL。

---

## 🔄 改动说明

### 代码改动

1. **`backend/requirements.txt`**
   - ✅ 添加 `psycopg2-binary==2.9.9`（PostgreSQL 驱动）

2. **`backend/app/database.py`**
   - ✅ 自动检测数据库类型（SQLite vs PostgreSQL）
   - ✅ SQLite 保留 `check_same_thread=False`
   - ✅ PostgreSQL 使用连接池配置

3. **`backend/app/config.py`**
   - ✅ 添加 PostgreSQL 配置说明

4. **`backend/.env.example`**
   - ✅ 添加多种 PostgreSQL 服务示例

---

## 💡 数据库选择

### 本地开发
保持使用 **SQLite**（无需改动）：
```env
DATABASE_URL=sqlite:///./data/review_tool.db
```

### 生产环境
推荐使用 **PostgreSQL**：

#### 选项 1：Neon（推荐 - 完全免费）
```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**优点**：
- ✅ 完全免费
- ✅ 3GB 存储
- ✅ 无限连接数
- ✅ 自动休眠节省资源

**获取方式**：
1. 访问 [neon.tech](https://neon.tech/)
2. 创建项目
3. 复制 Connection String

#### 选项 2：Supabase（免费，带管理界面）
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**优点**：
- ✅ 免费（500MB）
- ✅ 图形化管理界面
- ✅ 自动备份

**获取方式**：
1. 访问 [supabase.com](https://supabase.com/)
2. 创建项目
3. Settings → Database → Connection String

#### 选项 3：Vercel Postgres
```env
# Vercel 自动设置，无需手动配置
DATABASE_URL=postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
```

**优点**：
- ✅ 与 Vercel 完美集成
- ✅ 自动配置

**缺点**：
- ⚠️ 免费额度很有限（256MB，60小时/月）

---

## 🚀 迁移步骤

### 步骤 1：安装 PostgreSQL 驱动

```bash
cd backend
pip install -r requirements.txt
```

### 步骤 2：创建 PostgreSQL 数据库

选择上面的任一服务（推荐 Neon）并创建数据库。

### 步骤 3：初始化数据库表

```bash
# 设置环境变量（使用你的 PostgreSQL URL）
# Windows:
set DATABASE_URL=postgresql://user:password@host/dbname

# Mac/Linux:
export DATABASE_URL=postgresql://user:password@host/dbname

# 初始化表
python -c "from app.database import init_db; init_db()"
```

成功后应该看到表已创建（无报错）。

### 步骤 4：（可选）迁移现有数据

如果你有 SQLite 数据需要迁移：

#### 方法 A：使用 pgloader（推荐）

```bash
# 1. 安装 pgloader
# Ubuntu/Debian:
apt-get install pgloader

# Mac:
brew install pgloader

# 2. 运行迁移
pgloader sqlite://./data/review_tool.db postgresql://user:pass@host/db
```

#### 方法 B：手动导出/导入

创建 `backend/migrate_data.py`：

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.learning_item import LearningItem
from app.models.review_history import ReviewHistory

# 源数据库（SQLite）
source_url = "sqlite:///./data/review_tool.db"
source_engine = create_engine(source_url, connect_args={"check_same_thread": False})
SourceSession = sessionmaker(bind=source_engine)

# 目标数据库（PostgreSQL）
target_url = os.getenv("DATABASE_URL")
target_engine = create_engine(target_url)
TargetSession = sessionmaker(bind=target_engine)

# 迁移数据
with SourceSession() as source_session, TargetSession() as target_session:
    # 迁移学习项目
    items = source_session.query(LearningItem).all()
    for item in items:
        target_session.merge(item)

    # 迁移历史记录
    history = source_session.query(ReviewHistory).all()
    for record in history:
        target_session.merge(record)

    target_session.commit()
    print(f"Migrated {len(items)} items and {len(history)} history records")
```

运行：
```bash
export DATABASE_URL=postgresql://...
python backend/migrate_data.py
```

---

## 🔍 验证迁移

### 检查表是否创建

使用 PostgreSQL 客户端（如 pgAdmin、DBeaver）或命令行：

```sql
-- 列出所有表
\dt

-- 应该看到：
-- learning_items
-- review_history

-- 检查表结构
\d learning_items
\d review_history
```

### 测试应用

```bash
# 启动 backend
cd backend
uvicorn app.main:app --reload

# 访问 API 文档
# http://localhost:8000/docs

# 测试创建项目
# 通过 API 文档或前端测试
```

---

## 📝 数据库连接配置

### SQLite（本地开发）

```python
# 自动使用的配置
engine = create_engine(
    "sqlite:///./data/review_tool.db",
    connect_args={"check_same_thread": False}
)
```

### PostgreSQL（生产）

```python
# 自动使用的配置
engine = create_engine(
    "postgresql://user:pass@host/db",
    pool_pre_ping=True,      # 检查连接是否有效
    pool_size=5,             # 连接池大小
    max_overflow=10          # 最大溢出连接数
)
```

---

## 🔧 环境变量配置

### 本地开发（`.env`）

```env
# 使用 SQLite
DATABASE_URL=sqlite:///./data/review_tool.db
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 生产环境（Vercel/Render）

```env
# 使用 PostgreSQL（Neon 示例）
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
CORS_ORIGINS=["https://your-app.vercel.app"]
```

---

## ⚠️ 注意事项

### 1. SSL 连接

PostgreSQL 生产环境通常需要 SSL：
```
?sslmode=require
```

### 2. 连接池

PostgreSQL 支持连接池，已在代码中配置：
- `pool_size=5`：正常连接数
- `max_overflow=10`：高峰时最多额外 10 个连接

### 3. 时区

PostgreSQL 使用 `DateTime(timezone=True)`，已在 models 中配置。

### 4. UUID 类型

我们使用 `String(36)` 存储 UUID（兼容 SQLite 和 PostgreSQL）。
如果想优化，可以改用 PostgreSQL 的原生 UUID 类型。

---

## 🆚 SQLite vs PostgreSQL 对比

| 特性 | SQLite | PostgreSQL |
|------|--------|-----------|
| **部署** | 文件数据库 | 需要数据库服务器 |
| **并发** | 有限（写锁定） | 优秀（MVCC） |
| **扩展性** | 小型应用 | 大型应用 |
| **Vercel 兼容** | ❌ 需要持久化存储 | ✅ 完美支持 |
| **性能** | 小数据量快 | 大数据量更好 |
| **成本** | 免费 | 免费选项多 |

---

## ✅ 兼容性

### 完全向后兼容

所有改动都向后兼容：
- ✅ 本地开发仍然可以使用 SQLite
- ✅ SQLAlchemy models 同时支持两种数据库
- ✅ 无需改动业务逻辑代码

### 自动检测

代码会自动检测数据库类型并使用相应配置：

```python
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite 配置
else:
    # PostgreSQL 配置
```

---

## 🎯 下一步

1. **本地测试**：先用 SQLite 确保应用正常
2. **创建 PostgreSQL**：注册 Neon 并获取连接字符串
3. **初始化表**：使用 PostgreSQL URL 运行 `init_db()`
4. **部署到 Vercel**：设置环境变量并部署

---

## 📚 参考资源

- [Neon 文档](https://neon.tech/docs/)
- [Supabase 文档](https://supabase.com/docs)
- [SQLAlchemy PostgreSQL](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

迁移完成！🎉
