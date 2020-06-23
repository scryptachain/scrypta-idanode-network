import { Injectable } from '@nestjs/common'
var PouchDB = require('pouchdb')
var db = new PouchDB('rewards')
PouchDB.plugin(require('pouchdb-find'))
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
import * as ScryptaRPC from './libs/ScryptaRPC'
const axios = require('axios')
const fs = require('fs')

@Injectable()
export class AppService {
  getHello(): string {
    return 'REWARD POOL UP AND RUNNING'
  }

  getHistory(node): Promise<Object> {
    return new Promise(async response => {
      let graph = []
      let history = await db.find({
        selector: {
          node: node
        }
      })
      history.docs.sort(function (a, b) { return a.timestamp - b.timestamp })
      for (let k in history) {
        let point = history[k]
        graph.push(point)
      }
      response(graph)
    })
  }

  async getStatus(): Promise<Object> {
    return new Promise(async response => {
      let read = fs.readFileSync( './status' )
      response(JSON.parse(read))
    })
  }
}