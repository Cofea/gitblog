/**
 * 检查Notion SDK结构
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('@notionhq/client')

console.log('检查Notion SDK结构...\n')

// 初始化客户端
const notion = new Client({ auth: process.env.NOTION_TOKEN })

console.log('notion对象的所有属性:')
console.log(Object.keys(notion))

console.log('\nnotion.databases的所有方法:')
if (notion.databases) {
  console.log(Object.keys(notion.databases))
  console.log('\n类型:')
  Object.keys(notion.databases).forEach(key => {
    console.log(`  ${key}: ${typeof notion.databases[key]}`)
  })
}

console.log('\n@notionhq/client版本:')
try {
  const pkg = require('@notionhq/client/package.json')
  console.log(`  版本: ${pkg.version}`)
} catch (e) {
  console.log('  无法读取版本信息')
}
