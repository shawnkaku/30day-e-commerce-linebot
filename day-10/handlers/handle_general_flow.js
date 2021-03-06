const { LineHandler } = require('bottender')
const Product = require('../database/product.js')
const _ = require('lodash')

const requiredParam = param => {
  const requiredParamError = new Error(`Required parameter, "${param}" is missing.`)
  // preserve original stack trace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(requiredParamError, requiredParam)
  }
  throw requiredParamError
}

const toColumn = product => {
  return {
    thumbnailImageUrl: product.imgUrl,
    imageBackgroundColor: '#FFFFFF',
    title: product.id + '. ' + product.name, // product.id just for teaching
    text: product.detail,
    defaultAction: {
      type: 'postback',
      label: '我想要買！',
      text: '我想要買！',
      data: `flow=shoping&action=buy&productID=${product.id}`
    },
    actions: [
      {
        type: 'postback',
        label: '我想要買！',
        text: '我想要買！',
        data: `flow=shoping&action=buy&productID=${product.id}`
      }
    ]
  }
}

const toColumns = ({
  products = requiredParam('products'),
  offset
} = {}) => {
  let columns = _.map(products, toColumn)
  if (columns.length === 9 && offset) {
    columns.push({
      thumbnailImageUrl: 'https://i.imgur.com/0O9cN53.jpg',
      imageBackgroundColor: '#ddc39d',
      title: '想看更多嗎？', // product.id just for teaching
      text: '還有更多好甜好吃的糖果唷(招手',
      defaultAction: {
        type: 'postback',
        label: '我想看更多！',
        text: '我想看更多！',
        data: `flow=general&action=getProducts&offset=${offset}`
      },
      actions: [
        {
          type: 'postback',
          label: '我想看更多！',
          text: '我想看更多！',
          data: `flow=general&action=getProducts&offset=${offset}`
        }
      ]
    })
  }
  return columns
}

const handleGetProducts = async context => {
  const {offset} = context.event.postback.query
  const result = await Product.readProducts({offset})
  console.log(result.offset)
  let carouselProducts = {
    type: 'template',
    altText: '好吃好吃嚼嚼嚼',
    imageAspectRatio: 'rectangle',
    imageSize: 'cover',
    template: {
      type: 'carousel',
      columns: toColumns({products: result.products, offset: result.offset})
    }}
  context.reply([carouselProducts])
}

const isGetProducts = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getProducts') return true
  return false
}

const isGetMemberInfo = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getMemberInfo') return true
  return false
}

const isGetOrders = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getOrders') return true
  return false
}

const handleGetOrders = context => {
  context.replyText('You click getOrders')
}

const handleGetMemberInfo = context => {
  context.replyText('You click getMemberInfo')
}

module.exports = new LineHandler()
  .on(isGetOrders, handleGetOrders)
  .on(isGetMemberInfo, handleGetMemberInfo)
  .on(isGetProducts, handleGetProducts)
  .onEvent(context => console.log('Uncaught event:', context.event.rawEvent))
  .build()
