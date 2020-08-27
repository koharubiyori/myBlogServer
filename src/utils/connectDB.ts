import { 
  MongoClient, Db, Collection, FilterQuery, FindOneOptions, 
  Cursor, UpdateQuery, UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject,
  CollectionInsertOneOptions, InsertOneWriteOpResult, CollectionInsertManyOptions, InsertWriteOpResult, UpdateOneOptions, 
  UpdateManyOptions
} from 'mongodb'
import { dbConnectLink, dbName } from '~/config'
import { CollectionsData } from '~/@types/collections'

type MyCollections = {
  user: CollectionsData.User
  notification: CollectionsData.Notification
  article: CollectionsData.Article
  tag: CollectionsData.Tag
  articleCollection: CollectionsData.ArticleCollection
  comment: CollectionsData.Comment
  katakoto: CollectionsData.Katakoto
  settings: CollectionsData.Settings
}

interface MyCollection<CollectionKeys extends keyof MyCollections, _CollectionData = MyCollections[CollectionKeys]> extends Collection {
  findOne (filter: FilterQuery<_CollectionData>): Promise<_CollectionData | null>
  findOne (filter: FilterQuery<_CollectionData>, options: FindOneOptions): Promise<_CollectionData | null>
  find (filter: FilterQuery<_CollectionData>, options?: FindOneOptions): Cursor<_CollectionData>

  insertOne(docs: _CollectionData): Promise<InsertOneWriteOpResult<any>>
  insertOne(docs: _CollectionData, options: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<any>>
  insertMany(docs: _CollectionData[]): Promise<InsertWriteOpResult<any>>
  insertMany(docs: _CollectionData[], options: CollectionInsertManyOptions): Promise<InsertWriteOpResult<any>>

  updateOne (filter: FilterQuery<_CollectionData>, update: UpdateQuery<_CollectionData>): Promise<UpdateWriteOpResult>
  updateOne (filter: FilterQuery<_CollectionData>, update: UpdateQuery<_CollectionData>, options: UpdateOneOptions): Promise<UpdateWriteOpResult>
  updateMany (filter: FilterQuery<_CollectionData>, update: UpdateQuery<_CollectionData>): Promise<UpdateWriteOpResult>
  updateMany (filter: FilterQuery<_CollectionData>, update: UpdateQuery<_CollectionData>, options: UpdateManyOptions): Promise<UpdateWriteOpResult>

  deleteOne (filter: FilterQuery<_CollectionData>): Promise<DeleteWriteOpResultObject>
  deleteOne (filter: FilterQuery<_CollectionData>, options: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<DeleteWriteOpResultObject>
  deleteMany (filter: FilterQuery<_CollectionData>): Promise<DeleteWriteOpResultObject>
  deleteMany (filter: FilterQuery<_CollectionData>, options: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<DeleteWriteOpResultObject>
}
export interface MyDb extends Db {
  collection<T extends keyof MyCollections> (collectionName: T): MyCollection<T>
}

let dbClient: MongoClient  // 用于保存和数据库的连接
// 连接数据库，并自动选择config.ts中指定的库
export default async function connectDB(): Promise<MyDb>{
  if(!dbClient){
    try{
      dbClient = await MongoClient.connect(dbConnectLink, {
        useNewUrlParser: true,
        useUnifiedTopology: true    // 貌似是开启什么新的引擎，目前来看加了这个会导致出错时promise不响应，不加又会警告说以后会默认使用
      })
    }catch (e){
      console.log('数据库连接失败')
      throw new Error(e)
    }
  }
  
  return <MyDb>dbClient.db(dbName)
}
