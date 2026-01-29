/**
 * Notion to Markdown Blog Sync Script
 *
 * 此脚本从Notion数据库同步文章到Next.js博客
 * 功能：
 * - 连接Notion API获取已发布文章
 * - 转换Notion blocks为Markdown格式
 * - 下载并保存图片到本地
 * - 生成Next.js所需的frontmatter元数据
 * - 自动保存到data/blog/目录
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('@notionhq/client')
const { NotionToMarkdown } = require('notion-to-md')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// 初始化Notion客户端
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

// 配置
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const BLOG_DIR = path.join(process.cwd(), 'data', 'blog')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'static', 'images', 'notion')

// 确保目录存在
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true })
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

/**
 * 下载图片到本地
 * @param {string} url - 图片URL
 * @param {string} filename - 保存的文件名
 * @returns {Promise<string>} - 本地图片路径
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGES_DIR, filename)

    // 如果文件已存在，直接返回
    if (fs.existsSync(filepath)) {
      console.log(`图片已存在，跳过下载: ${filename}`)
      resolve(`/static/images/notion/${filename}`)
      return
    }

    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filepath)

    protocol
      .get(url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`图片下载成功: ${filename}`)
          resolve(`/static/images/notion/${filename}`)
        })
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {}) // 删除不完整的文件
        console.error(`图片下载失败: ${filename}`, err.message)
        reject(err)
      })
  })
}

/**
 * 生成安全的文件名（slug）
 * @param {string} title - 文章标题
 * @returns {string} - 文件名
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // 保留中文、字母、数字
    .replace(/^-+|-+$/g, '') // 移除首尾的连字符
    .substring(0, 100) // 限制长度
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string} dateString - ISO日期字符串
 * @returns {string} - 格式化后的日期
 */
function formatDate(dateString) {
  if (!dateString) {
    return new Date().toISOString().split('T')[0]
  }
  return new Date(dateString).toISOString().split('T')[0]
}

/**
 * 从Notion页面提取属性
 * @param {Object} page - Notion页面对象
 * @returns {Object} - 提取的属性
 */
function extractPageProperties(page) {
  const properties = page.properties

  // 提取标题
  const title = properties.Title?.title?.[0]?.plain_text || 'Untitled'

  // 提取发布日期
  const publishDate = properties.PublishDate?.date?.start || new Date().toISOString()

  // 提取标签
  const tags = properties.Tags?.multi_select?.map((tag) => tag.name) || []

  // 提取摘要
  const summary = properties.Summary?.rich_text?.[0]?.plain_text || ''

  // 提取作者
  const author = properties.Author?.rich_text?.[0]?.plain_text || 'default'

  // 提取自定义slug（如果有）
  const customSlug = properties.Slug?.rich_text?.[0]?.plain_text || ''

  // 提取封面图
  let coverImage = null
  if (properties.CoverImage?.files?.[0]) {
    const file = properties.CoverImage.files[0]
    coverImage = file.file?.url || file.external?.url || null
  } else if (page.cover) {
    coverImage = page.cover.file?.url || page.cover.external?.url || null
  }

  return {
    title,
    publishDate,
    tags,
    summary,
    author,
    customSlug,
    coverImage,
    pageId: page.id,
  }
}

/**
 * 处理Markdown内容中的图片
 * @param {string} markdown - Markdown内容
 * @param {string} pageId - 页面ID（用于生成唯一文件名）
 * @returns {Promise<string>} - 处理后的Markdown
 */
async function processImagesInMarkdown(markdown, pageId) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match
  const imagePromises = []
  let processedMarkdown = markdown

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [fullMatch, altText, imageUrl] = match

    // 跳过已经是本地路径的图片
    if (imageUrl.startsWith('/static/')) {
      continue
    }

    // 生成唯一文件名
    const urlObj = new URL(imageUrl)
    const extension = path.extname(urlObj.pathname) || '.jpg'
    const filename = `${pageId}-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`

    imagePromises.push(
      downloadImage(imageUrl, filename)
        .then((localPath) => {
          processedMarkdown = processedMarkdown.replace(imageUrl, localPath)
        })
        .catch((err) => {
          console.error(`处理图片失败: ${imageUrl}`, err)
        })
    )
  }

  await Promise.all(imagePromises)
  return processedMarkdown
}

/**
 * 生成frontmatter
 * @param {Object} props - 页面属性
 * @param {string} coverImagePath - 封面图本地路径
 * @returns {string} - frontmatter字符串
 */
function generateFrontmatter(props, coverImagePath) {
  const { title, publishDate, tags, summary, author } = props

  const frontmatter = [
    '---',
    `title: '${title.replace(/'/g, "''")}'`, // 转义单引号
    `date: '${formatDate(publishDate)}'`,
    `tags: [${tags.map((tag) => `'${tag}'`).join(', ')}]`,
    `draft: false`,
    `summary: '${summary.replace(/'/g, "''")}'`,
  ]

  if (coverImagePath) {
    frontmatter.push(`images: ['${coverImagePath}']`)
  }

  frontmatter.push(`authors: ['${author}']`)
  frontmatter.push('---')

  return frontmatter.join('\n')
}

/**
 * 从Notion获取已发布的文章
 * @returns {Promise<Array>} - 文章列表
 */
async function getPublishedPosts() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'PublishDate',
          direction: 'descending',
        },
      ],
    })

    console.log(`找到 ${response.results.length} 篇已发布文章`)
    return response.results
  } catch (error) {
    console.error('获取Notion文章失败:', error.message)
    throw error
  }
}

/**
 * 转换单篇文章
 * @param {Object} page - Notion页面对象
 */
async function convertPost(page) {
  let props
  try {
    props = extractPageProperties(page)
    console.log(`\n处理文章: ${props.title}`)

    // 获取页面内容并转换为Markdown
    const mdblocks = await n2m.pageToMarkdown(page.id)
    let markdown = n2m.toMarkdownString(mdblocks).parent

    // 处理Markdown中的图片
    markdown = await processImagesInMarkdown(markdown, props.pageId)

    // 处理封面图
    let coverImagePath = null
    if (props.coverImage) {
      try {
        const coverFilename = `cover-${props.pageId}.jpg`
        coverImagePath = await downloadImage(props.coverImage, coverFilename)
      } catch (err) {
        console.error('封面图下载失败:', err.message)
      }
    }

    // 生成frontmatter
    const frontmatter = generateFrontmatter(props, coverImagePath)

    // 合并frontmatter和内容
    const fullContent = `${frontmatter}\n\n${markdown}`

    // 生成文件名
    const slug = props.customSlug || generateSlug(props.title)
    const filename = `${slug}.mdx`
    const filepath = path.join(BLOG_DIR, filename)

    // 写入文件
    fs.writeFileSync(filepath, fullContent, 'utf-8')
    console.log(`✅ 文章保存成功: ${filename}`)

    return { success: true, filename }
  } catch (error) {
    const title = props?.title || '未知文章'
    console.error(`❌ 转换文章失败 (${title}):`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================')
  console.log('开始同步Notion博客文章...')
  console.log('========================================')

  // 验证环境变量
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ 错误: 未设置 NOTION_TOKEN 环境变量')
    console.error('请在 .env.local 文件中配置 NOTION_TOKEN')
    process.exit(1)
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.error('❌ 错误: 未设置 NOTION_DATABASE_ID 环境变量')
    console.error('请在 .env.local 文件中配置 NOTION_DATABASE_ID')
    process.exit(1)
  }

  try {
    // 获取已发布文章
    const posts = await getPublishedPosts()

    if (posts.length === 0) {
      console.log('\n⚠️  没有找到已发布的文章')
      console.log('请确保Notion数据库中有Status为"Published"的文章')
      return
    }

    // 转换所有文章
    const results = []
    for (const post of posts) {
      const result = await convertPost(post)
      results.push(result)
    }

    // 输出统计
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log('\n========================================')
    console.log('同步完成!')
    console.log(`✅ 成功: ${successful} 篇`)
    console.log(`❌ 失败: ${failed} 篇`)
    console.log('========================================')

    if (failed > 0) {
      console.log('\n失败的文章:')
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`- ${r.error}`)
        })
    }
  } catch (error) {
    console.error('\n❌ 同步过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
