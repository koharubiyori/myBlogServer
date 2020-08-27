import 'module-alias/register'
import connectDB from '../utils/connectDB'
import { collections, uploadDirs, uploadsPath } from '~/config'
import fs from 'fs'

async function main(){
  try{
    const db = await connectDB()
  
    // 创建集合
    await Promise.all(
      collections.map(name => db.createCollection(name))
    )
  
    // 创建图片上传文件夹
    uploadDirs.forEach(name => fs.mkdirSync(uploadsPath + '/' + name))
  }catch(e){
    throw e
  }
}

main()
