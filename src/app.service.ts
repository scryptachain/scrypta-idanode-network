import { Injectable } from '@nestjs/common'
var PouchDB = require('pouchdb')
var db = new PouchDB('rewards')
PouchDB.plugin(require('pouchdb-find'))

@Injectable()
export class AppService {
  getHello(): string {
    return 'REWARD POOL UP AND RUNNING'
  }

  getHistory(node): Promise<Object> {
    return new Promise(async response => {
      let history = {}
      return history
    })
  }
}