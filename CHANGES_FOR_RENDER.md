# 📝 为 Render 部署所做的改变

这个文档总结了为了部署到 Render 而做的所有代码改变。

---

## ✅ 新增文件

### 1. `backend/render.yaml` ⭐ 重要
Render 的自动部署配置文件，包含：
- 服务类型、区域、方案（免费）
- 构建和启动命令
- **持久化磁盘配置**（确保 SQLite 数据不丢失）
- 环境变量

### 2. `backend/runtime.txt`
指定 Python 版本：`python-3.9.18`

### 3. `backend/Procfile`
通用部署配置文件（Railway、Heroku 等也可用）

### 4. `RENDER_DEPLOY.md`
完整的 Render 部署指南（中文），包括：
- 详细部署步骤
- 常见问题解决
- 成本对比
- 监控和日志

### 5. `RENDER_QUICK_START.md`
快速开始指南（3 步搞定）

---

## 📝 修改的文件

### 1. `backend/app/database.py`
**改变**：支持环境变量指定 data 目录
```python
# 原来：
os.makedirs("data", exist_ok=True)

# 现在：
data_dir = os.getenv("DATA_DIR", "data")
os.makedirs(data_dir, exist_ok=True)
```

**原因**：为了兼容 Render 的持久化磁盘路径

### 2. `backend/app/config.py`
**改变**：添加了注释说明数据库配置
```python
# Database
# 支持 Render 持久化存储：如果在 Render 上会使用持久化磁盘路径
DATABASE_URL: str = "sqlite:///./data/review_tool.db"
```

**原因**：让配置更清晰

### 3. `backend/.env.example`
**改变**：添加了更详细的配置说明和生产环境示例

---

## 🔑 关键配置说明

### Render 持久化存储配置

这是使用 Render 最重要的配置！

在 `render.yaml` 中：
```yaml
disk:
  name: review-tool-data
  mountPath: /opt/render/project/src/data
  sizeGB: 1  # 免费方案最大值
```

对应的环境变量：
```yaml
DATABASE_URL=sqlite:////opt/render/project/src/data/review_tool.db
```

**注意**：
- Mount Path 必须与 DATABASE_URL 中的路径匹配
- SQLite URL 中是 **4 个斜杠**：`sqlite:///` + `/opt/...`
- 如果不配置 Disk，数据会在服务重启后丢失！

---

## 🆚 与本地开发的区别

| 配置项 | 本地开发 | Render 生产环境 |
|--------|---------|----------------|
| 数据库路径 | `./data/review_tool.db` | `/opt/render/project/src/data/review_tool.db` |
| DATABASE_URL | `sqlite:///./data/review_tool.db` | `sqlite:////opt/render/project/src/data/review_tool.db` |
| CORS_ORIGINS | `["http://localhost:3000","http://localhost:5173"]` | `["https://your-app.vercel.app"]` |
| 数据持久化 | 本地文件系统 | Render Disk（需要配置） |

---

## ⚠️ 重要事项

### 1. 必须配置持久化磁盘
不配置的话，数据会在服务重启后丢失！

### 2. CORS 配置
部署 Frontend 后，必须更新 Backend 的 `CORS_ORIGINS` 环境变量。

### 3. 环境变量优先级
Render Dashboard 中设置的环境变量 > `.env` 文件

### 4. 自动部署
推送到 GitHub 的 `main` 分支会自动触发 Render 重新部署。

---

## 🔄 本地开发不受影响

所有改变都是向后兼容的：
- ✅ 本地开发仍然正常工作
- ✅ 原有的 `.env` 配置仍然有效
- ✅ 数据库仍然存储在 `./data/` 目录

---

## 📊 改变总结

- **新增文件**：5 个（配置和文档）
- **修改文件**：3 个（微小改动，向后兼容）
- **删除文件**：0 个
- **破坏性改变**：0 个

所有改变都是为了支持 Render 部署，同时保持本地开发体验不变。

---

## 下一步

查看部署指南：
- **快速开始**：[RENDER_QUICK_START.md](./RENDER_QUICK_START.md)
- **详细指南**：[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
