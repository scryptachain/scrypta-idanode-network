import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
let console = require('better-console')
import * as ScryptaRPC from './libs/ScryptaRPC'
const axios = require('axios')
var PouchDB = require('pouchdb')
var db = new PouchDB('rewards')
PouchDB.plugin(require('pouchdb-find'))
let Crypto = require('crypto')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  checkSystems()
  setInterval(function () {
    // checkSystems()
  }, 60000)
}

async function checkSystems() {
  let RPC = new ScryptaRPC.Wallet
  let getinfo = await RPC.request('getinfo')
  let dbinfo
  try{
    dbinfo = await db.info()
  }catch(e){
    console.error('DB IS NOT WORKING')
  }
  
  
  if (getinfo !== undefined && dbinfo !== undefined) {
    if (getinfo['result'].blocks > 0) {
      console.info('WALLET IS OK, STARTING IDANODE CHECK')
      let idanodes = await scrypta.returnNodes()
      for (let k in idanodes) {
        let node = idanodes[k]
        console.log('SYNC CHECK ON ' + node)
        let check = await scrypta.get('/wallet/getinfo', node)
        if (check.blocks !== undefined && check.toindex <= 1) {
          console.info('IDANODE IS SYNCED [' + check.toindex + ' BLOCKS]')
          console.log('INTEGRITY CHECK ON ' + node)
          let checkversion = await checkVersion(check.version)
          if(checkversion){
            console.info('IDANODE INTEGRITY CHECK PASSED')

            let timestamp = new Date().getTime()
            let _id = Crypto.createHash("sha256").update(timestamp + 'N' + node).digest("hex")

            db.put({
              _id: _id,
              node: node,
              block: check.blocks,
              toindex: check.toindex
            })
        }else{
          console.error('IDANODE IS CORRUPTED')
        }
        }
      }
    } else {
      console.error('WALLET ISN\'T SYNCING')
    }
  } else {
    console.error('WALLET IS NOT READY, PLEASE RUN IT FIRST.')
  }

}

function checkVersion(version) {
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

bootstrap()