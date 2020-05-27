import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
let console = require('better-console')
import * as ScryptaRPC from './libs/ScryptaRPC'
import { scrypt } from 'crypto'
const axios = require('axios')
var PouchDB = require('pouchdb')
var db = new PouchDB('rewards')
let Crypto = require('crypto')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  checkSystems()
  setInterval(function(){
    // checkSystems()
  }, 60000)
}

async function checkSystems(){
  let RPC = new ScryptaRPC.Wallet
  let getinfo = await RPC.request('getinfo')

  if(getinfo !== undefined){
    if(getinfo['result'].blocks > 0){
      console.info('WALLET IS OK, STARTING IDANODE CHECK')
      let idanodes = await scrypta.returnNodes()
      for(let k in idanodes){
        let node = idanodes[k]
        console.log('CHECKING ' + node)
        let check = await scrypta.get('/wallet/getinfo', node)
        if(check.blocks !== undefined){
          let timestamp = new Date().getTime()
          let _id = Crypto.createHash("sha256").update(timestamp + 'N' + node).digest("hex")
          db.put({
            _id: _id,
            node: node,
            block: check.blocks,
            toindex: check.toindex
          })
        }
      }
    }else{
      console.error('WALLET ISN\'T SYNCING')
    }
  }else{
    console.error('WALLET IS NOT READY, PLEASE RUN IT FIRST.')
  }

}

bootstrap()