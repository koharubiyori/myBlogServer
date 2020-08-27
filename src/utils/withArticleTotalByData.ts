import { CollectionsData } from "~/@types/collections"
import { MyDb } from "./connectDB"

type ArticleWithTotal = CollectionsData.Article & { 
  commentTotal: number 
  collectTotal: number
}

export default (db: MyDb, articleData: CollectionsData.Article): Promise<ArticleWithTotal> => new Promise(async (resolve, reject) =>{
  try{
    let commentTotal = await db.collection('comment').find({ articleId: articleData._id, deleted: false }).count()
    let collectTotal = await db.collection('articleCollection').find({ articleId: articleData._id }).count()
    resolve({ ...articleData, commentTotal, collectTotal })
  }catch(e){ 
    reject(e) 
  }
})