import { ObjectID } from 'mongodb'
export namespace CollectionsData{
  interface User {
    _id?: ObjectID
    account: string
    name: string
    password: string
    token: string
    avatar: string
    salt: string
    deleted: boolean
  }

  interface Notification {
    _id?: ObjectID
    userId: ObjectID
    operatorId: ObjectID
    type: 'like' | 'system' | 'comment' | 'reply'
    isChecked: boolean
    deleted: boolean
    commentId?: ObjectID
    articleId?: ObjectID
  }

  interface Article {
    _id?: ObjectID
    title: string
    profile: string
    content: string
    tags: string[]
    updatedAt: Date
    headImg: string
    readNum: number
    deleted: boolean
    createdYear: number
    createdMonth: number
    isTop: boolean
  }
  
  interface ArticleCollection {
    _id?: ObjectID
    articleId: ObjectID
    userId: ObjectID
  }

  interface Tag {
    _id?: ObjectID
    name: string
    deleted: boolean
  }

  interface Comment {
    _id?: ObjectID
    articleId: ObjectID
    userId: ObjectID 
    parentId: ObjectID | ''
    content: string
    deleted: boolean
  }

  interface Katakoto {
    _id?: ObjectID
    content: string
    deleted: boolean
  }

  interface Settings {
    _id?: ObjectID
    title: string
    subtitle: string
    bgImg: string
  }
}
