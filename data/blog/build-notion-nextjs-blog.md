---
title: '从零搭建一个基于Notion的精美个人博客：Next.js + GitHub Actions全自动化部署指南'
date: '2024-01-28'
tags: ['Next.js', 'Notion', 'GitHub Actions', '博客搭建', '教程']
draft: false
summary: '详细记录如何使用Next.js和Notion API搭建一个精美的个人博客，实现从Notion写作到自动部署的完整工作流。仅需1-2小时配置，之后只需在Notion中写作即可自动发布。'
images: []
authors: ['default']
---

# 从零搭建一个基于Notion的精美个人博客

## 前言

作为一个喜欢写作的开发者，我一直在寻找一个完美的博客解决方案：
- 🎨 **视觉精美**：不想要单调的默认主题
- ✍️ **写作友好**：希望专注于内容，不想折腾Markdown编辑器
- 🔄 **自动化**：写完文章就能自动发布，不想手动部署
- 💰 **成本低廉**：最好是免费或低成本
- 🚀 **性能优秀**：加载速度要快

经过一番探索，我找到了这个完美方案：
- **Notion** 作为内容管理系统（免费，体验优秀）
- **Next.js** 作为博客框架（快速，SEO友好）
- **GitHub Actions** 实现自动化部署（免费）
- **GitHub Pages** 或 **Vercel** 免费托管

**最终效果**：在Notion中写作 → 发布按钮 → 自动同步到博客 → 完成！

本文将详细记录整个搭建过程，包括遇到的坑和解决方案。

---

## 技术栈选择

### 为什么选择这个技术栈？

#### 1. Tailwind Next.js Starter Blog

这是GitHub上一个10k+ stars的成熟博客模板：
- 📱 完美的响应式设计
- 🌙 内置暗黑模式
- 🔍 全文搜索功能（Kbar）
- 💬 评论系统支持（giscus）
- 📊 分析统计集成
- 🎨 Tailwind CSS，易于定制

**官方仓库**：https://github.com/timlrx/tailwind-nextjs-starter-blog

#### 2. Notion作为CMS

- ✅ 免费且体验优秀
- ✅ 支持丰富的内容格式
- ✅ 可视化编辑
- ✅ 移动端App支持
- ✅ 协作功能

#### 3. GitHub Actions自动化

- ✅ 免费额度充足（2000分钟/月）
- ✅ 与GitHub无缝集成
- ✅ 配置简单
- ✅ 定时任务支持

---

## 完整部署流程

### 阶段一：准备工作（5分钟）

#### 1. 环境要求

确保你的开发环境满足以下要求：

```bash
# 检查Node.js版本（需要18+）
node --version
# v18.0.0 或更高

# 检查npm版本
npm --version
# 8.0.0 或更高
```

#### 2. 准备账号

- GitHub账号
- Notion账号
- （可选）阿里云账号（用于域名）

---

### 阶段二：Notion配置（30分钟）

这一步是整个方案的核心，我们要在Notion中搭建一个博客文章数据库。

#### 1. 创建Notion文章数据库

**步骤：**

1. 打开Notion，点击侧边栏 **"+ New page"**
2. 选择 **"Table"** 类型的数据库
3. 命名为 **"博客文章库"** 或 **"Blog Posts"**

#### 2. 配置数据库字段

点击数据库右上角的 **"+ New"** 添加以下属性（Properties）：

| 字段名 | 类型 | 选项/说明 | 必填 |
|--------|------|-----------|------|
| **Title** | Title | 文章标题（默认字段） | ✅ |
| **Status** | Select | 选项：Published, Draft, Archived | ✅ |
| **PublishDate** | Date | 发布日期 | ✅ |
| **Tags** | Multi-select | 标签：技术、生活、教程等 | ✅ |
| **Summary** | Text | 文章摘要（用于SEO） | ✅ |
| **Slug** | Text | 自定义URL路径（可选） | ❌ |
| **Author** | Text | 作者名称 | ❌ |
| **CoverImage** | Files & media | 封面图 | ❌ |

**配置截图示例：**

```
┌─────────────────────────────────────────────────────────┐
│ Title           │ Status    │ PublishDate │ Tags       │
├─────────────────────────────────────────────────────────┤
│ 我的第一篇文章   │ Published │ 2024-01-28  │ 教程, 技术 │
│ 草稿文章        │ Draft     │ 2024-01-29  │ 生活       │
└─────────────────────────────────────────────────────────┘
```

**重要提示**：
- `Status` 字段必须有 **"Published"** 选项（大小写敏感）
- 只有Status为Published的文章才会被同步到博客

#### 3. 创建Notion Integration

Notion Integration是一个API密钥，允许外部应用访问你的Notion数据。

**步骤：**

1. 访问 https://www.notion.so/my-integrations
2. 点击 **"+ New integration"**
3. 填写表单：
   ```
   Name: GitHub Blog Sync
   Associated workspace: 选择你的workspace
   Capabilities: ✅ Read content
   ```
4. 点击 **"Submit"**
5. 复制生成的 **Internal Integration Token**

**Token格式示例**：
```
secret_abcdefghijklmnopqrstuvwxyz123456789ABCDEFG
```

⚠️ **安全提示**：这个Token相当于数据库的访问密码，请妥善保管，不要泄露！

#### 4. 连接Integration到数据库

**步骤：**

1. 回到你的 **"博客文章库"** 数据库页面
2. 点击右上角的 **"..."** 菜单
3. 选择 **"Connections"** → **"Connect to"**
4. 在弹出的列表中找到 **"GitHub Blog Sync"**
5. 点击连接

**验证连接成功**：
- 连接后，你会在数据库页面顶部看到Integration图标

#### 5. 获取Database ID

Database ID是数据库的唯一标识符。

**步骤：**

1. 在浏览器中打开 **"博客文章库"** 页面
2. 查看地址栏URL，格式类似：
   ```
   https://www.notion.so/yourworkspace/abc123def456?v=xyz789
   ```
3. 复制 `abc123def456` 这部分（`?v=` 之前的32位字符串）

**Database ID特征**：
- 32位字符
- 包含字母、数字和连字符
- 示例：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`

⚠️ **保存这两个关键信息**：
- ✅ Notion Token (secret_xxx...)
- ✅ Database ID (a1b2c3d4-e5f6-7890-abcd-ef1234567890)

#### 6. 创建测试文章

在数据库中添加一篇测试文章：

1. 点击 **"+ New"** 创建新文章
2. 填写必填字段：
   ```
   Title: 我的第一篇博客文章
   Status: Published
   PublishDate: 2024-01-28
   Tags: 测试, 教程
   Summary: 这是一篇测试文章，用于验证Notion同步功能。
   ```
3. 在文章正文中随意写一些内容

**Notion阶段完成！** ✅

---

### 阶段三：项目初始化（15分钟）

#### 1. 克隆模板仓库

打开终端（Windows用户使用PowerShell或Git Bash），执行：

```bash
# 创建项目目录
mkdir gitblog
cd gitblog

# 克隆模板
git clone https://github.com/timlrx/tailwind-nextjs-starter-blog.git .

# 查看文件
ls -la
```

**预期输出**：
```
.git
.github
app/
components/
data/
package.json
...
```

#### 2. 安装依赖

```bash
# 安装基础依赖
npm install

# 安装Notion相关依赖
npm install @notionhq/client notion-to-md dotenv
```

**安装时间**：约2-3分钟（取决于网络速度）

**验证安装**：
```bash
# 检查node_modules目录
ls node_modules/@notionhq
# 应该看到 client 目录

# 检查package.json
cat package.json | grep notion
# 应该看到三个notion相关的包
```

#### 3. 配置环境变量

创建 `.env.local` 文件（这个文件不会被提交到Git）：

```bash
# 创建环境变量文件
touch .env.local

# 编辑文件（使用你喜欢的编辑器）
```

**`.env.local` 内容**：
```bash
# Notion Integration Token
NOTION_TOKEN=secret_你的实际Token

# Notion Database ID
NOTION_DATABASE_ID=你的实际DatabaseID
```

**示例**：
```bash
NOTION_TOKEN=secret_abcdefghijklmnopqrstuvwxyz123456789ABCDEFG
NOTION_DATABASE_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**验证配置**：
```bash
# 检查文件内容
cat .env.local

# 确认.gitignore包含.env.local
cat .gitignore | grep .env.local
# 应该看到: .env.local
```

#### 4. 配置博客基本信息

编辑 `data/siteMetadata.js`：

```javascript
/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: '我的技术博客',              // 修改为你的博客名称
  author: '张三',                     // 修改为你的名字
  headerTitle: '张三的博客',          // 修改为博客标题
  description: '分享技术、思考与生活', // 修改为你的博客描述
  language: 'zh-CN',                  // 中文
  theme: 'system',                    // system, dark 或 light
  siteUrl: 'https://blog.yourdomain.com', // 修改为你的域名
  siteRepo: 'https://github.com/yourusername/gitblog', // 修改为你的仓库
  email: 'your@email.com',            // 修改为你的邮箱
  github: 'https://github.com/yourusername', // 修改为你的GitHub
  // ... 其他配置保持默认或根据需要修改
  locale: 'zh-CN',
}

module.exports = siteMetadata
```

**自定义建议**：
- `title`: 简洁有力的博客名称
- `description`: 20-50字的博客简介
- `siteUrl`: 如果暂时没有域名，可以先用 `https://yourusername.github.io/gitblog`

---

### 阶段四：创建Notion同步脚本（已完成）

这一步我已经帮你完成了！脚本位于 `scripts/sync-notion.js`

#### 脚本功能说明

这个300多行的脚本实现了以下功能：

1. **连接Notion API**
   ```javascript
   const notion = new Client({ auth: process.env.NOTION_TOKEN })
   ```

2. **查询已发布文章**
   - 只获取 Status = "Published" 的文章
   - 按发布日期降序排序

3. **转换内容格式**
   - Notion blocks → Markdown
   - 支持标题、段落、列表、代码块等
   - 保留格式和样式

4. **处理图片**
   - 自动下载Notion图片到本地
   - 保存到 `public/static/images/notion/`
   - 更新Markdown中的图片链接

5. **生成Frontmatter**
   ```markdown
   ---
   title: '文章标题'
   date: '2024-01-28'
   tags: ['技术', '教程']
   draft: false
   summary: '文章摘要'
   images: ['/static/images/notion/cover.jpg']
   authors: ['default']
   ---
   ```

6. **保存文章**
   - 保存到 `data/blog/` 目录
   - 文件名：`slug.mdx` 或自动生成

#### 测试同步脚本

在项目根目录执行：

```bash
node scripts/sync-notion.js
```

**预期输出**：
```
========================================
开始同步Notion博客文章...
========================================
找到 1 篇已发布文章

处理文章: 我的第一篇博客文章
图片下载成功: cover-abc123.jpg
✅ 文章保存成功: wo-de-di-yi-pian-bo-ke-wen-zhang.mdx

========================================
同步完成!
✅ 成功: 1 篇
❌ 失败: 0 篇
========================================
```

**验证结果**：
```bash
# 查看生成的文章文件
ls data/blog/

# 查看文章内容
cat data/blog/wo-de-di-yi-pian-bo-ke-wen-zhang.mdx
```

**常见问题排查**：

❌ **错误: 未设置 NOTION_TOKEN**
```bash
# 检查.env.local是否存在
cat .env.local

# 检查环境变量是否正确
```

❌ **错误: 获取Notion文章失败**
```bash
# 检查Token是否正确
# 检查Integration是否连接到数据库
# 检查数据库中是否有Status为Published的文章
```

---

### 阶段五：本地开发测试（10分钟）

#### 1. 启动开发服务器

```bash
npm run dev
```

**预期输出**：
```
   ▲ Next.js 15.2.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.100:3000

 ✓ Ready in 3.2s
```

#### 2. 访问博客

打开浏览器，访问 http://localhost:3000

**你应该看到**：
- ✅ 精美的博客首页
- ✅ 导航栏：Home, Blog, Tags, Projects, About
- ✅ 博客文章列表（包括你从Notion同步的文章）
- ✅ 搜索功能（按 Ctrl+K 或 Cmd+K）
- ✅ 暗黑模式切换按钮

#### 3. 测试文章页面

点击博客列表中的文章，验证：
- ✅ 文章标题正确显示
- ✅ 发布日期正确
- ✅ 标签正确
- ✅ 文章内容格式正确
- ✅ 图片正确加载
- ✅ 代码高亮正常

#### 4. 测试响应式设计

按 `F12` 打开开发者工具，切换到移动设备视图：
- ✅ 布局自动适配
- ✅ 导航菜单变为汉堡菜单
- ✅ 字体大小适中
- ✅ 图片自适应

**本地测试通过！** ✅

---

### 阶段六：GitHub配置（20分钟）

#### 1. 初始化Git仓库

```bash
# 查看当前远程仓库
git remote -v

# 修改为你自己的仓库地址
git remote set-url origin https://github.com/你的用户名/gitblog.git

# 或者如果没有远程仓库，添加一个
git remote add origin https://github.com/你的用户名/gitblog.git
```

#### 2. 提交代码

```bash
# 查看当前状态
git status

# 添加所有文件
git add .

# 创建提交
git commit -m "feat: 初始化博客项目

- 配置Notion同步脚本
- 更新博客元数据
- 配置GitHub Actions工作流
"

# 推送到GitHub
git push -u origin main
```

**预期输出**：
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 1.2 MiB | 2.5 MiB/s, done.
Total 150 (delta 45), reused 0 (delta 0)
To https://github.com/你的用户名/gitblog.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

#### 3. 配置GitHub Secrets

这一步很重要！我们需要将Notion Token和Database ID安全地存储在GitHub中。

**步骤：**

1. 打开浏览器，访问你的GitHub仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**

**添加第一个Secret：**
```
Name: NOTION_TOKEN
Secret: secret_你的实际Token
```
点击 **Add secret**

**添加第二个Secret：**
```
Name: NOTION_DATABASE_ID
Secret: 你的实际DatabaseID
```
点击 **Add secret**

**验证配置**：
- 你应该在Secrets列表中看到两个密钥
- 密钥值会被隐藏显示为 `***`

#### 4. 启用GitHub Pages

**步骤：**

1. 在仓库页面，点击 **Settings** 标签
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 下拉框中选择 **GitHub Actions**
4. 点击 **Save**

**说明**：
- 我们不使用传统的分支部署方式
- 而是使用GitHub Actions自动构建和部署
- 这样可以在部署前自动同步Notion文章

#### 5. 触发首次部署

**方式一：手动触发（推荐）**

1. 点击仓库的 **Actions** 标签
2. 在左侧选择 **"Sync Notion & Deploy Blog"** 工作流
3. 点击右上角的 **Run workflow** 按钮
4. 在弹出的对话框中，确保分支选择为 `main`
5. 点击绿色的 **Run workflow** 按钮

**方式二：等待定时触发**
- 工作流配置了每天凌晨2点（北京时间）自动运行
- 或者当你推送代码到main分支时也会触发

#### 6. 查看部署进度

在Actions页面，你会看到工作流的运行状态：

**运行中**：
```
🟡 Sync Notion & Deploy Blog
   Started 1 minute ago
```

**步骤详情**：
- ✅ Checkout代码
- ✅ 设置Node.js环境
- ✅ 安装依赖
- 🟡 从Notion同步文章
- ⏳ 构建Next.js静态站点
- ⏳ 部署到GitHub Pages

**完成后**：
```
✅ Sync Notion & Deploy Blog
   Completed in 3m 24s
```

点击查看详细日志，确认每一步都成功。

#### 7. 访问你的博客

部署成功后，你的博客地址是：

```
https://你的GitHub用户名.github.io/gitblog/
```

**示例**：
- GitHub用户名：zhangsan
- 博客地址：https://zhangsan.github.io/gitblog/

**首次访问注意**：
- GitHub Pages可能需要5-10分钟生效
- 如果看到404，稍等片刻再试

**验证清单**：
- ✅ 博客首页加载正常
- ✅ 从Notion同步的文章正确显示
- ✅ 图片加载正常
- ✅ 链接跳转正常
- ✅ HTTPS证书有效（地址栏显示🔒）

**GitHub部署完成！** ✅

---

### 阶段七：自定义域名配置（可选，30分钟）

如果你有自己的域名（如在阿里云购买的域名），可以绑定到博客。

#### 1. 在GitHub Pages配置域名

**步骤：**

1. 进入仓库 **Settings** → **Pages**
2. 在 **Custom domain** 输入框中填入：`blog.yourdomain.com`
3. 勾选 **Enforce HTTPS** （强制HTTPS访问）
4. 点击 **Save**

**GitHub会开始验证你的域名**：
```
DNS check in progress
GitHub is checking if your DNS settings are configured correctly.
```

#### 2. 在阿里云配置DNS

**步骤：**

1. 登录 [阿里云控制台](https://dns.console.aliyun.com/)
2. 点击左侧菜单 **域名** → **域名列表**
3. 找到你的域名，点击 **解析**
4. 点击 **添加记录**

**配置参数**：
```
记录类型: CNAME
主机记录: blog
解析线路: 默认
记录值: 你的GitHub用户名.github.io
TTL: 600（10分钟）
```

**示例**：
```
记录类型: CNAME
主机记录: blog
记录值: zhangsan.github.io
```

5. 点击 **确定**

**添加额外的A记录（推荐）**：

为了更好的访问体验，可以额外添加GitHub Pages的A记录：

```bash
# 添加4条A记录，主机记录都填 blog
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

#### 3. 验证DNS配置

等待5-30分钟后，使用以下命令验证：

**Windows PowerShell**：
```powershell
nslookup blog.yourdomain.com
```

**预期输出**：
```
服务器:  dns.google
Address:  8.8.8.8

非权威应答:
名称:    yourusername.github.io
Address:  185.199.108.153
Aliases:  blog.yourdomain.com
```

**macOS/Linux**：
```bash
dig blog.yourdomain.com

# 或者
host blog.yourdomain.com
```

#### 4. 更新GitHub Actions配置

为了让自定义域名在每次部署后保留，需要更新工作流配置。

编辑 `.github/workflows/sync-and-deploy.yml`，在deploy步骤中找到：

```yaml
- name: 部署到GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

这个配置已经包含了CNAME文件的处理，无需修改。

#### 5. 更新博客配置

编辑 `data/siteMetadata.js`，更新域名：

```javascript
const siteMetadata = {
  // ... 其他配置
  siteUrl: 'https://blog.yourdomain.com', // 更新为你的自定义域名
  // ...
}
```

提交并推送更改：

```bash
git add data/siteMetadata.js
git commit -m "chore: 更新自定义域名配置"
git push
```

#### 6. 验证自定义域名

访问你的自定义域名：`https://blog.yourdomain.com`

**验证清单**：
- ✅ 域名解析成功
- ✅ HTTPS证书有效
- ✅ 博客内容正确显示
- ✅ 所有链接使用新域名

**等待HTTPS证书生成**：
- GitHub会自动申请Let's Encrypt证书
- 首次配置可能需要等待1-24小时
- 证书有效期90天，会自动续期

**自定义域名配置完成！** ✅

---

## 日常使用工作流

### 完美的写作发布流程

配置完成后，你的日常工作流程变得极其简单：

#### 1. 在Notion中写作

1. 打开Notion，进入"博客文章库"
2. 点击 **+ New** 创建新文章
3. 填写必填字段：
   ```
   Title: 我的新文章标题
   Status: Draft  （先设为草稿）
   PublishDate: 2024-01-28
   Tags: 技术, 教程
   Summary: 这篇文章讲解如何...
   ```
4. 在正文中尽情写作：
   - 使用Notion的所有功能
   - 插入图片、代码块、列表等
   - 保存会自动同步

#### 2. 预览和编辑

- 在Notion中随时预览效果
- 修改内容会实时保存
- 可以在多设备间无缝切换

#### 3. 发布文章

当文章写完并检查无误后：

1. 将 **Status** 改为 **Published**
2. 确认 **PublishDate** 是你想要的发布日期
3. 保存

#### 4. 等待自动同步

有两种方式触发同步：

**方式一：等待定时同步**
- 每天凌晨2点（北京时间）自动同步
- 无需任何操作

**方式二：手动立即同步**
1. 访问GitHub仓库的Actions页面
2. 选择"Sync Notion & Deploy Blog"工作流
3. 点击"Run workflow"
4. 等待3-5分钟

#### 5. 完成！

访问你的博客，新文章已经自动发布！

---

## 高级功能配置

### 1. 添加评论系统（giscus）

使用GitHub Discussions作为评论后端，免费且无广告。

#### 步骤：

**1) 在GitHub仓库启用Discussions**

1. 进入仓库 **Settings**
2. 勾选 **Features** 下的 **Discussions**

**2) 配置giscus**

1. 访问 https://giscus.app
2. 在页面中输入你的仓库：`yourusername/gitblog`
3. 选择配置：
   ```
   页面 ↔️ Discussions 映射: pathname
   Discussion 分类: Announcements
   特性: ✅ 启用主评论区上方的反应
   主题: 根据GitHub主题自动选择
   ```
4. 页面会生成配置代码

**3) 更新博客配置**

在 `.env.local` 中添加：

```bash
NEXT_PUBLIC_GISCUS_REPO=yourusername/gitblog
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=R_kgDOxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx
```

**4) 提交更改**

```bash
git add .env.local data/siteMetadata.js
git commit -m "feat: 添加giscus评论系统"
git push
```

等待部署完成后，文章页面底部会出现评论框！

### 2. 添加Google Analytics

跟踪博客访问数据。

#### 步骤：

**1) 获取Google Analytics ID**

1. 访问 https://analytics.google.com
2. 创建新媒体资源
3. 获取测量ID（格式：`G-XXXXXXXXXX`）

**2) 更新配置**

编辑 `data/siteMetadata.js`：

```javascript
const siteMetadata = {
  // ... 其他配置
  analytics: {
    googleAnalytics: {
      googleAnalyticsId: 'G-XXXXXXXXXX', // 你的测量ID
    },
  },
}
```

**3) 更新CSP配置**

编辑 `next.config.js`，在CSP中添加Google Analytics域名：

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data: https://www.notion.so https://*.amazonaws.com www.google-analytics.com;
  connect-src * www.google-analytics.com analytics.google.com;
  // ...
`
```

提交并推送更改。

### 3. 自定义主题颜色

修改博客的主色调。

编辑 `tailwind.config.js`：

```javascript
// 在文件顶部引入colors
import colors from 'tailwindcss/colors'

export default {
  theme: {
    extend: {
      colors: {
        primary: colors.blue,     // 改为：pink, purple, indigo, emerald等
        gray: colors.neutral,
      },
    },
  },
}
```

**可选颜色**：
- `colors.blue` - 蓝色（默认）
- `colors.purple` - 紫色
- `colors.pink` - 粉色
- `colors.indigo` - 靛蓝色
- `colors.emerald` - 翠绿色
- `colors.rose` - 玫瑰色

### 4. 添加友情链接页面

创建自定义的友链页面。

**1) 创建数据文件**

创建 `data/friendsData.js`：

```javascript
const friendsData = [
  {
    title: '张三的博客',
    description: '一个热爱技术的开发者',
    imgSrc: '/static/images/friends/zhangsan.png',
    href: 'https://zhangsan.com',
  },
  {
    title: '李四的技术笔记',
    description: '记录学习和思考的地方',
    imgSrc: '/static/images/friends/lisi.png',
    href: 'https://lisi.dev',
  },
]

export default friendsData
```

**2) 创建页面组件**

创建 `app/friends/page.tsx`：

```typescript
import friendsData from '@/data/friendsData'
import Card from '@/components/Card'

export const metadata = {
  title: '友情链接',
  description: '我的朋友们',
}

export default function Friends() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            友情链接
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            我的朋友们的博客
          </p>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            {friendsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
```

---

## 遇到的问题和解决方案

在搭建过程中，我遇到了一些问题，这里记录解决方案。

### 问题1：GitHub Actions同步失败

**错误信息**：
```
Error: ❌ 错误: 未设置 NOTION_TOKEN 环境变量
```

**原因**：
- GitHub Secrets配置错误或未配置

**解决方案**：
1. 检查Secrets名称是否完全匹配（大小写敏感）
2. 确认Token和Database ID正确
3. 查看Actions日志的详细错误信息

### 问题2：文章图片不显示

**现象**：
- 博客中的图片显示为broken image

**原因**：
- Notion图片链接需要认证
- 图片未正确下载到本地

**解决方案**：
1. 确保同步脚本正常运行
2. 检查 `public/static/images/notion/` 目录是否有图片
3. 在Notion中使用公开的图片URL，或让脚本自动下载

### 问题3：自定义域名配置后无法访问

**现象**：
- 自定义域名显示404或DNS错误

**解决方案**：
1. 等待DNS生效（最长48小时）
2. 检查DNS配置是否正确：
   ```bash
   nslookup blog.yourdomain.com
   ```
3. 确认GitHub Pages的Custom domain设置正确
4. 清除浏览器缓存和DNS缓存：
   ```bash
   # Windows
   ipconfig /flushdns

   # macOS
   sudo dscacheutil -flushcache
   ```

### 问题4：构建时出现内存不足错误

**错误信息**：
```
JavaScript heap out of memory
```

**解决方案**：

在 `package.json` 中增加Node.js内存限制：

```json
{
  "scripts": {
    "build:static": "cross-env NODE_OPTIONS='--max-old-space-size=4096' EXPORT=true INIT_CWD=$PWD next build"
  }
}
```

### 问题5：Notion特殊块无法正确转换

**现象**：
- Synced blocks、Database blocks等特殊内容无法显示

**解决方案**：
- 避免在文章中使用这些特殊块
- 使用基础的blocks：标题、段落、列表、代码块、图片等
- 或者扩展 `notion-to-md` 库来支持更多块类型

---

## 性能优化建议

### 1. 使用Vercel部署（推荐）

Vercel提供了比GitHub Pages更快的全球CDN。

#### 步骤：

1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击 **New Project**
4. 选择 `gitblog` 仓库
5. 配置环境变量：
   ```
   NOTION_TOKEN=secret_xxx...
   NOTION_DATABASE_ID=xxx...
   ```
6. 点击 **Deploy**

**优势**：
- ⚡ 更快的全球CDN
- 🔄 自动部署（无需Actions）
- 📊 详细的分析数据
- 🌐 免费的自定义域名SSL

### 2. 图片优化

**建议**：
- 使用WebP格式
- 压缩图片（推荐TinyPNG）
- 封面图控制在500KB以内
- 文章图片控制在200KB以内

**Notion中的图片处理**：
- 上传前先压缩
- 使用合适的尺寸（不要上传过大的原图）

### 3. 增量构建（未来优化）

当文章数量超过100篇时，可以考虑：
- 只重新构建修改过的文章
- 使用ISR（Incremental Static Regeneration）

---

## 成本分析

### 免费方案（推荐新手）

| 项目 | 服务 | 费用 | 限制 |
|------|------|------|------|
| 托管 | GitHub Pages | 免费 | 100GB流量/月 |
| CMS | Notion | 免费 | 个人版功能充足 |
| CI/CD | GitHub Actions | 免费 | 2000分钟/月 |
| SSL证书 | Let's Encrypt | 免费 | 自动续期 |
| **总计** | - | **0元** | 适合个人博客 |

### 付费升级方案

| 项目 | 服务 | 费用 | 优势 |
|------|------|------|------|
| 托管 | Vercel Pro | $20/月 | 更快CDN、更多功能 |
| CMS | Notion Plus | $10/月 | 无限存储、更多功能 |
| 域名 | 阿里云 | ~60元/年 | 专业形象 |
| **总计** | - | **~400元/月** | 专业博主 |

**我的建议**：
- ✅ 新手：完全免费方案，只买域名（~60元/年）
- ✅ 有流量后：升级到Vercel（免费版也够用）
- ❌ 不建议：购买Notion付费版（个人博客用不到）

---

## 总结与展望

### 我们实现了什么？

经过1-2小时的配置，我们搭建了一个：
- ✅ **视觉精美**的个人博客
- ✅ **自动化**的发布流程
- ✅ **零成本**（或低成本）运营
- ✅ **高性能**的静态站点
- ✅ **易维护**的系统

### 核心优势

**对比传统方案**：

| 方案 | 写作体验 | 部署难度 | 运维成本 | 性能 |
|------|---------|---------|---------|------|
| WordPress | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Hexo/Hugo | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **本方案** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**本方案的独特优势**：
- 🎯 Notion的极致写作体验
- 🤖 完全自动化的发布流程
- 💰 几乎零运营成本
- ⚡ 静态站点的极致性能

### 适用场景

**适合你，如果你：**
- ✅ 喜欢在Notion中写作
- ✅ 想要自动化发布流程
- ✅ 追求简洁美观的设计
- ✅ 预算有限
- ✅ 不想折腾服务器

**不适合你，如果你：**
- ❌ 需要复杂的后端功能
- ❌ 需要用户注册系统
- ❌ 需要实时内容更新
- ❌ 文章数量巨大（1000+篇）

### 后续优化方向

1. **功能增强**
   - [ ] 全文搜索优化
   - [ ] 阅读统计
   - [ ] 相关文章推荐
   - [ ] Newsletter订阅

2. **性能优化**
   - [ ] 图片懒加载
   - [ ] 增量构建
   - [ ] CDN加速

3. **内容管理**
   - [ ] 文章版本控制
   - [ ] 草稿预览功能
   - [ ] 定时发布

### 参考资源

**官方文档**：
- [Next.js Documentation](https://nextjs.org/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [GitHub Actions](https://docs.github.com/actions)

**社区资源**：
- [Tailwind Next.js Starter Blog GitHub](https://github.com/timlrx/tailwind-nextjs-starter-blog)
- [Notion API Community](https://developers.notion.com/community)
- [giscus](https://giscus.app/)

---

## 结语

从零搭建这个博客系统是一次有趣的经历。通过组合现代化的工具和服务，我们创建了一个既美观又实用的个人博客。

**最重要的是**：配置完成后，你可以完全专注于写作，技术细节都交给自动化流程处理。

希望这篇教程对你有帮助！如果你在搭建过程中遇到问题，欢迎在评论区讨论。

**现在，开始享受写作吧！** ✍️

---

**标签**: #Next.js #Notion #博客搭建 #GitHub Actions #自动化部署

**最后更新**: 2024-01-28
