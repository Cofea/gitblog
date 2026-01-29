/**
 * Notion连接测试脚本
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('@notionhq/client')

console.log('========================================')
console.log('测试Notion连接...')
console.log('========================================\n')

// 检查环境变量
console.log('1. 检查环境变量:')
console.log(`   NOTION_TOKEN: ${process.env.NOTION_TOKEN ? '已设置 ✓' : '未设置 ✗'}`)
console.log(`   NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID ? '已设置 ✓' : '未设置 ✗'}`)

if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
  console.error('\n❌ 错误: 环境变量未设置')
  process.exit(1)
}

console.log(`\n2. Token格式检查:`)
console.log(`   Token前缀: ${process.env.NOTION_TOKEN.substring(0, 10)}...`)
console.log(`   Database ID: ${process.env.NOTION_DATABASE_ID}`)

// 初始化Notion客户端
console.log('\n3. 初始化Notion客户端...')
const notion = new Client({ auth: process.env.NOTION_TOKEN })

console.log(`   Client对象: ${notion ? '创建成功 ✓' : '创建失败 ✗'}`)
console.log(`   databases属性: ${notion.databases ? '存在 ✓' : '不存在 ✗'}`)
console.log(`   databases.query方法: ${typeof notion.databases?.query}`)

// 测试API调用
async function testConnection() {
  try {
    console.log('\n4. 测试API连接...')
    console.log('   正在调用 notion.databases.query...')

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      page_size: 1,
    })

    console.log('   ✓ API连接成功!')
    console.log(`   找到 ${response.results.length} 条记录`)

    if (response.results.length > 0) {
      const page = response.results[0]
      console.log(`\n5. 示例页面信息:`)
      console.log(`   ID: ${page.id}`)
      console.log(`   创建时间: ${page.created_time}`)
      console.log(`   属性数量: ${Object.keys(page.properties).length}`)
      console.log(`   属性列表:`)
      Object.keys(page.properties).forEach(key => {
        console.log(`     - ${key} (${page.properties[key].type})`)
      })
    }

    console.log('\n========================================')
    console.log('✅ 测试通过!')
    console.log('========================================')

  } catch (error) {
    console.error('\n❌ API调用失败:')
    console.error(`   错误类型: ${error.name}`)
    console.error(`   错误信息: ${error.message}`)

    if (error.code) {
      console.error(`   错误代码: ${error.code}`)
    }

    if (error.status) {
      console.error(`   HTTP状态: ${error.status}`)
    }

    console.log('\n可能的原因:')
    console.log('1. Token不正确或已过期')
    console.log('2. Database ID不正确')
    console.log('3. Integration未连接到数据库')
    console.log('4. 网络连接问题')

    console.log('\n解决方法:')
    console.log('1. 检查Token是否正确复制')
    console.log('2. 检查Database ID是否正确')
    console.log('3. 在Notion中确认Integration已连接到数据库')
    console.log('   (数据库页面 → ... → Connections)')

    process.exit(1)
  }
}

testConnection()
