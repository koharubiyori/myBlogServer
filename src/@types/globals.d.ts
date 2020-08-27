declare const _rootPath: string
declare const _DEV: boolean

declare namespace NodeJS {
  interface Global {
    _rootPath: typeof _rootPath
    _DEV: typeof _DEV
  }
}

declare interface MySession extends Express.Session {
  registerCaptcha?: string
}

declare interface MyCookie {
  userToken: string
}

declare interface PageData<Data = any> {
  total: number
  pageTotal: number
  limit: number
  currentPage: number
  list: Data[]
}

declare type StringValue<T> = {
  [K in keyof T]: string
}