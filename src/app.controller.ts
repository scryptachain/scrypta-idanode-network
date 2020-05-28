import { Controller, Get, Post, Body } from '@nestjs/common'
import { AppService } from './app.service'
let ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async getHistory(@Body() request): Promise<Object> {
    if(request.node !== undefined){
      let idanodes = await scrypta.returnNodes()
      if(idanodes.indexOf(request.node) !== undefined){
        return this.appService.getHistory(request.node)
      }else{
        return {
          success: false,
          error: 'Node ' + request.node + ' is not a valid node'
        }
      }
    }else{
      return {
        success: false,
        error: 'Node parameter missing'
      }
    }
  }
}