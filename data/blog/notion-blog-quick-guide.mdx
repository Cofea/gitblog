---
title: 'Notion博客部署快速指南 - 30分钟上线你的个人博客'
date: '2024-01-28'
tags: ['快速指南', 'Notion', 'Next.js', '博客']
draft: false
summary: '这是一份精简的快速部署指南，帮助你在30分钟内完成Notion博客的搭建和部署。适合想要快速上手的开发者。'
authors: ['default']
---

# Notion博客快速部署指南

> 🚀 **目标**：30分钟内完成博客部署
>
> 📋 **前提**：已有GitHub账号、Notion账号、Node.js 18+

---

## 一、Notion配置（10分钟）

### 1. 创建数据库

1. 打开Notion → 新建页面 → 选择Table
2. 命名：**博客文章库**
3. 添加字段：

```
Title (标题)          - Title类型
Status (状态)         - Select类型，选项：Published, Draft, Archived
PublishDate (日期)    - Date类型
Tags (标签)           - Multi-select类型
Summary (摘要)        - Text类型
```

### 2. 创建Integration

1. 访问：https://www.notion.so/my-integrations
2. 点击 **+ New integration**
3. 名称：`GitHub Blog Sync`
4. 复制Token（`secret_xxx...`）

### 3. 连接数据库

1. 打开博客文章库页面
2. 右上角 **...** → **Connections** → 选择你的Integration

### 4. 获取Database ID

从数据库URL中复制ID：
```
https://www.notion.so/yourworkspace/[这里是DatabaseID]?v=xxx
```

📝 **保存**：
- Notion Token
- Database ID

---

## 二、本地配置（10分钟）

### 1. 克隆项目

```bash
# 克隆到本地
git clone https://github.com/timlrx/tailwind-nextjs-starter-blog.git gitblog
cd gitblog

# 安装依赖
npm install
npm install @notionhq/client notion-to-md dotenv
```

### 2. 配置环境变量

创建 `.env.local`：

```bash
NOTION_TOKEN=secret_你的Token
NOTION_DATABASE_ID=你的DatabaseID
```

### 3. 配置博客信息

编辑 `data/siteMetadata.js`：

```javascript
title: '你的博客名',
author: '你的名字',
siteUrl: 'https://yourusername.github.io/gitblog',
email: 'your@email.com',
github: 'https://github.com/yourusername',
```

### 4. 测试同步

```bash
node scripts/sync-notion.js
npm run dev
```

访问 http://localhost:3000 查看效果

---

## 三、GitHub部署（10分钟）

### 1. 推送代码

```bash
git remote set-url origin https://github.com/你的用户名/gitblog.git
git add .
git commit -m "feat: 初始化博客"
git push -u origin main
```

### 2. 配置Secrets

进入GitHub仓库：
1. **Settings** → **Secrets and variables** → **Actions**
2. 添加：
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`

### 3. 启用Pages

1. **Settings** → **Pages**
2. Source选择：**GitHub Actions**

### 4. 部署

1. **Actions** → 选择工作流
2. 点击 **Run workflow**
3. 等待3-5分钟

✅ **完成！** 访问 `https://你的用户名.github.io/gitblog`

---

## 四、日常使用

### 写作流程

1. Notion中创建文章
2. Status设为 **Published**
3. 等待每天凌晨2点自动同步
4. 或手动触发：Actions → Run workflow

---

## 常见问题

### Q1: Actions失败？
- 检查Secrets是否正确配置
- 查看Actions日志

### Q2: 图片不显示？
- 确认同步脚本运行成功
- 检查 `public/static/images/notion/` 目录

### Q3: 404错误？
- 等待5-10分钟让Pages生效
- 确认Pages已启用

---

## 下一步

- [ ] 配置自定义域名
- [ ] 添加评论系统（giscus）
- [ ] 启用Google Analytics
- [ ] 自定义主题颜色

---

## 参考文档

- 📖 [完整部署文档](./build-notion-nextjs-blog.md)
- 📚 [README.md](../../README.md)
- 🔧 [SETUP-GUIDE.md](../../SETUP-GUIDE.md)

---

**享受写作！** ✨
