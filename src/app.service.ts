import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
import * as ScryptaRPC from './libs/ScryptaRPC'
const axios = require('axios')
const fs = require('fs')
import { Reward, RewardDocument } from './schemas/reward.schema';
let console = require('better-console')
let Crypto = require('crypto')

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {
    const app = this
    app.checkSystems()

    setInterval(function () {
      app.checkSystems()
    }, 60000)

  }

  async checkSystems() {
    let RPC = new ScryptaRPC.Wallet
    let getinfo = await RPC.request('getinfo')
    const app = this

    if (getinfo !== undefined) {
      if (getinfo['result'].blocks > 0) {
        console.info('WALLET IS OK, STARTING IDANODE CHECK')
        let idanodes = await scrypta.returnNodes()
        let timestamp = new Date().getTime()

        for (let k in idanodes) {
          let node = idanodes[k]
          console.log('SYNC CHECK ON ' + node)
          let call = await axios.get(node + '/wallet/getinfo', { timeout: 2500 }).catch(err => {
            console.log('IDANODE DOESN\'T ANSWER')
          })
          try {
            if (call !== undefined && call.data !== undefined) {
              let check = call.data
              if (check.blocks !== undefined && check.toindex <= 1) {
                console.info('IDANODE IS SYNCED [' + check.toindex + ' BLOCKS]')
                console.log('INTEGRITY CHECK ON ' + node)

                let checksumversion = await this.checkVersion(check.version)
                let integritycheck = await scrypta.get('/wallet/integritycheck', node)

                if (checksumversion === integritycheck.checksum) {
                  console.info('IDANODE INTEGRITY CHECK PASSED')

                  let id = Crypto.createHash("sha256").update(timestamp + 'N' + node).digest("hex")
                  let ref = Crypto.createHash("sha256").update(timestamp.toString()).digest("hex")

                  let newReward = this.rewardModel({
                    id: id,
                    node: node,
                    block: check.blocks,
                    toindex: check.toindex,
                    paid: false,
                    timestamp: timestamp,
                    ref: ref
                  })

                  newReward.save()

                } else {
                  console.error('IDANODE IS CORRUPTED')
                }
              } else {
                console.log('NODE NOT WORKING')
              }
            } else {
              console.log('NODE NOT WORKING')
            }
          } catch (e) {
            console.log(e)
          }
        }

        app.writeStatus()
        app.checkPayouts()


      } else {
        console.error('WALLET ISN\'T SYNCING')
      }
    } else {
      console.error('WALLET IS NOT READY, PLEASE RUN IT FIRST.')
    }

  }

  checkVersion(version) {
    return new Promise(async response => {
      try {
        let checksums_git = await axios.get('https://raw.githubusercontent.com/scryptachain/scrypta-idanodejs/master/checksum')
        let checksums = checksums_git.data.split("\n")
        for (let x in checksums) {
          let checksum = checksums[x].split(':')
          if (checksum[0] === version) {
            response(checksum[1])
          }
        }
        response(false)
      } catch (e) {
        console.log(e)
        response(false)
      }
    })
  }

  async checkPayouts() {
    let idanodes = await scrypta.returnNodes()
    console.info('CHECKING PAYOUTS')
    let unpaid = await this.rewardModel.find({
      paid: false
    }).sort({ block: -1 }).exec()

    let payoutByNodes = {}
    for (let x in unpaid) {
      let payout = unpaid[x]
      if (payoutByNodes[payout.node] === undefined) {
        payoutByNodes[payout.node] = []
      }
      if (payout.paid === false) {
        payoutByNodes[payout.node].push(payout)
      }
    }

    let RPC = new ScryptaRPC.Wallet
    let getinfo = await RPC.request('getinfo')
    let balance = getinfo['result']['balance']
    let stake = idanodes.length * 5000
    balance = balance - stake

    console.log('POOL BALANCE IS ' + balance + ' lyra')
    let totpayouts = 0
    let maxpayouts = 1440

    if (balance !== undefined && balance > 0) {
      for (let k in payoutByNodes) {
        console.info(k + ' HAVE ' + payoutByNodes[k].length + ' UNPAID PAYOUTS')
        totpayouts += payoutByNodes[k].length
      }
      for (let k in payoutByNodes) {
        var share = (balance * payoutByNodes[k].length / totpayouts).toFixed(8)
        console.info(k + ' HAVE ' + share + ' LYRA TO EARN')
      }

      let midpayouts = totpayouts / idanodes.length
      console.log('MID PAYOUTS ARE ' + midpayouts)

      if (midpayouts >= maxpayouts) {
        console.log('24H PASSED, DISTRIBUTING SHARES.')
        let nodes_git = await axios.get('https://raw.githubusercontent.com/scryptachain/scrypta-idanode-network/master/peersv2')
        let raw_nodes = nodes_git.data.split("\n")
        let unlockwallet = await RPC.request('walletpassphrase', [process.env.WALLET_PASSWORD, 999999])
        const defaultIdanodeName = 'idanodejs'

        if (unlockwallet['error'] === null) {
          for (let x in raw_nodes) {
            let node = raw_nodes[x].split(':')
            let idanodeName = node[3] ? node[3] : defaultIdanodeName
            let url = 'https://' + idanodeName + node[0] + '.scryptachain.org'

            let address = await scrypta.getAddressFromPubKey(node[2])
            console.info('SENDING PAYOUT TO ' + url + ' -> ADDRESS IS ' + address)
            let validateaddress = await RPC.request('validateaddress', [address])
            if (validateaddress['result']['isvalid'] !== undefined && validateaddress['result']['isvalid'] === true) {
              let sharelessfees = parseFloat(share) - 0.003
              await RPC.request('settxfee', [0.003])
              let txid = await RPC.request('sendtoaddress', [address, sharelessfees])
              if (txid['result'] !== undefined && txid['error'] === null) {
                let payouts = payoutByNodes[url]
                for (let xx in payouts) {
                  payouts[xx].paid = true
                  try {
                    await payouts[xx].save()
                    console.log('SEND SUCCESS TXID IS: ' + txid['result'])
                  } catch (e) {
                    console.log(e)
                  }
                }
              }
            }
          }
          await RPC.request('walletpassphrase', [process.env.WALLET_PASSWORD, 999999999, true])
        } else {
          console.error('WALLET PASSPHRASE IS WRONG')
        }
      } else {
        console.log('LESS THAN 24H PASSED.')
      }
    } else {
      console.log('NOT ENOUGH BALANCE.')
    }
  }

  async writeStatus() {
    console.log('WRITING STATUS')
    let RPC = new ScryptaRPC.Wallet
    let getinfo = await RPC.request('getinfo')
    let idanodes = await scrypta.returnNodes()
    let unpaid = await this.rewardModel.find({
      paid: false
    }).sort({ block: -1 }).exec()
    let payoutByNodes = {}
    let payoutByNodesCount = {}

    for (let x in unpaid) {
      let payout = unpaid[x]
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
      earnings[k] = share
      if (balance > 0) {
        let percentage = (100 / balance * parseFloat(share)).toFixed(2)
        shares[k] = parseFloat(percentage)
        earnings[k] = parseFloat(share) - 0.003
      } else {
        shares[k] = 0
      }
    }

    let midpayouts = totpayouts / idanodes.length

    let status = {
      uptime: payoutByNodesCount,
      timing: parseFloat(midpayouts.toFixed(0)),
      earnings: earnings,
      shares: shares,
      stake: balance
    }

    fs.writeFileSync('./status', JSON.stringify(status))

  }

  getHello(): string {
    return 'REWARD POOL UP AND RUNNING'
  }

  getHistory(node): Promise<Object> {
    return new Promise(async response => {
      let graph = []
      let history = await this.rewardModel.find({
        node: node
      }).sort({ timestamp: -1 }).exec()
      for (let k in history) {
        let point = history[k]
        graph.push(point)
      }
      response(graph)
    })
  }

  async getStatus(): Promise<Object> {
    return new Promise(async response => {
      let read = fs.readFileSync('./status')
      response(JSON.parse(read))
    })
  }
}