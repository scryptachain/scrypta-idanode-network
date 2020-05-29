import { Injectable } from '@nestjs/common'
var PouchDB = require('pouchdb')
var db = new PouchDB('rewards')
PouchDB.plugin(require('pouchdb-find'))
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
import * as ScryptaRPC from './libs/ScryptaRPC'
const axios = require('axios')

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

      let dbinfo

      try {
        dbinfo = await db.info()
      } catch (e) {
        response('DB IS NOT WORKING')
      }
      if (dbinfo !== undefined) {
        let RPC = new ScryptaRPC.Wallet
        let getinfo = await RPC.request('getinfo')
        let idanodes = await scrypta.returnNodes()
        let unpaid = await db.find({
          selector: {
            paid: false
          }
        })
        unpaid.docs.sort(function (a, b) { return a.block - b.block })
        let toPay = unpaid.docs
        let payoutByNodes = {}
        let payoutByNodesCount = {}

        for (let x in toPay) {
          let payout = toPay[x]
          if (payoutByNodes[payout.node] === undefined) {
            payoutByNodes[payout.node] = []
          }
          if (payout.paid === false) {
            payoutByNodes[payout.node].push(payout)
          }
        }
        let balance = getinfo['result']['balance']
        let stake = idanodes.length * 5000
        balance = balance - stake

        if (balance < 0) {
          balance = 0
        }
        let totpayouts = 0

        for (let k in payoutByNodes) {
          payoutByNodesCount[k] = payoutByNodes[k].length
          totpayouts += payoutByNodes[k].length
        }
        let shares = {}
        let earnings = {}
        for (let k in payoutByNodes) {
          var share = (balance * payoutByNodes[k].length / totpayouts).toFixed(8)
          earnings[k] = share + ' LYRA'
          if (balance > 0) {
            let percentage = (100 / balance * parseFloat(share)).toFixed(2)
            shares[k] = parseFloat(percentage)
          } else {
            shares[k] = 0
          }
        }

        let midpayouts = totpayouts / idanodes.length

        response({
          uptime: payoutByNodesCount,
          timing: parseFloat(midpayouts.toFixed(0)),
          earnings: earnings,
          shares: shares,
          stake: balance
        })
      }
    })
  }
}