# Notion博客系统

基于 Next.js + Notion API 的自动化博客系统。在Notion写作，自动同步发布。

## ✨ 核心特性

- 🎨 精美设计 - 10k+ stars的成熟模板
- 🔄 自动同步 - Notion写作自动发布
- 🌐 免费托管 - GitHub Pages
- 📱 响应式 + 🌙 暗黑模式
- 🔍 SEO优化 - sitemap/RSS
- 💬 评论系统 - giscus

## 🚀 快速开始

**详细步骤请查看**：[快速开始.md](./快速开始.md)

### 三步部署

1. **Notion配置**（30分钟）
   - 创建数据库并配置字段（详见 [Notion配置指南](./Notion数据库字段配置详细指南.md)）
   - 创建Integration获取Token
   - 获取Database ID

2. **本地配置**（10分钟）
   - 配置 `.env.local`
   - 修改 `data/siteMetadata.js`
   - 测试同步：`node scripts/sync-notion.js`

3. **GitHub部署**（20分钟）
   - 推送代码到GitHub
   - 配置Secrets（Token和Database ID）
   - 启用GitHub Pages
   - 触发部署

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| [快速开始.md](./快速开始.md) | 一步步部署指南 |
| [Notion配置指南](./Notion数据库字段配置详细指南.md) | Notion数据库详细配置 |
| [完整教程](./data/blog/build-notion-nextjs-blog.md) | 6000字详细教程 |
| [快速参考](./data/blog/notion-blog-quick-guide.md) | 精简版指南 |

## 📂 项目结构

```
gitblog/
├── .github/workflows/
│   └── sync-and-deploy.yml      # 自动化部署
├── scripts/
│   └── sync-notion.js           # Notion同步脚本
├── data/
│   ├── blog/                    # 文章目录
│   └── siteMetadata.js          # 博客配置
├── .env.local                   # 环境变量（需配置）
└── 快速开始.md                   # 快速开始指南
```

## ⚙️ 必需配置

### 1. Notion数据库字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| Title | 标题 | ✅ | 文章标题 |
| Status | 单选 | ✅ | 必须包含"Published"选项 |
| PublishDate | 日期 | ✅ | 发布日期 |
| Tags | 多选 | ✅ | 文章标签 |
| Summary | 文本 | ✅ | 文章摘要 |

详细配置：[Notion配置指南](./Notion数据库字段配置详细指南.md)

### 2. 环境变量（.env.local）

```bash
NOTION_TOKEN=secret_你的Token
NOTION_DATABASE_ID=你的DatabaseID
```

### 3. 博客信息（data/siteMetadata.js）

```javascript
title: '你的博客名称',
author: '你的名字',
siteUrl: 'https://你的用户名.github.io/gitblog',
email: 'your@email.com',
github: 'https://github.com/你的用户名',
```

### 4. GitHub Secrets

在仓库Settings中添加：
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

## 📝 日常使用

1. Notion中写作
2. Status改为"Published"
3. 等待每天凌晨2点自动同步（或手动触发Actions）
4. 完成 🎉

## 🔧 高级配置

### 自定义域名

1. GitHub Pages配置域名
2. 阿里云DNS添加CNAME：`你的用户名.github.io`
3. 更新 `data/siteMetadata.js` 中的 `siteUrl`

### 启用评论系统（giscus）

1. 仓库启用Discussions
2. 访问 https://giscus.app 获取配置
3. 在 `.env.local` 添加配置：
   ```bash
   NEXT_PUBLIC_GISCUS_REPO=你的用户名/gitblog
   NEXT_PUBLIC_GISCUS_REPOSITORY_ID=xxx
   NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=xxx
   ```

### 添加Google Analytics

在 `data/siteMetadata.js` 中：

```javascript
analytics: {
  googleAnalytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
  },
}
```

### 自定义主题颜色

编辑 `tailwind.config.js`：

```javascript
colors: {
  primary: colors.blue,  // 可改为：pink, purple, indigo等
  gray: colors.neutral,
}
```

## 🐛 常见问题

### Q: Actions同步失败？
**A**: 检查GitHub Secrets配置，查看Actions日志。

### Q: Status必须是英文吗？
**A**: 是的！必须是 `Published`（大小写敏感），不能是中文"已发布"。

### Q: 图片不显示？
**A**: 确认同步脚本运行成功，检查 `public/static/images/notion/` 目录。

### Q: 自定义域名404？
**A**: 等待DNS生效（最长48小时），检查DNS配置。

## 💰 成本

| 项目 | 服务 | 费用 |
|------|------|------|
| 托管 | GitHub Pages | 免费 |
| CMS | Notion | 免费 |
| CI/CD | GitHub Actions | 免费 |
| 域名 | 阿里云（可选） | ~60元/年 |

**总计：0-60元/年**

## 🔗 资源链接

- [Notion API](https://developers.notion.com/)
- [Next.js文档](https://nextjs.org/docs)
- [原始模板](https://github.com/timlrx/tailwind-nextjs-starter-blog)
- [giscus评论](https://giscus.app/)

---

**开始写作！** ✨

_基于 Tailwind Next.js Starter Blog 构建_
