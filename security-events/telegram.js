const { PubSub } = require('@google-cloud/pubsub')

class Telegram {
  constructor () {
    this.pubsub = new PubSub()
  }

  emit (name = 'SCC', msg = 'test') {
    const topic = this.pubsub.topic(name)
    const publisher = topic.publisher()

    const data = Buffer.from(msg)

    const callback = (err, messageId) => {
      if (err) {
        // Error handling omitted.
      }
      console.log(`Message ${messageId} published.`)
    }

    return publisher.publish(data, callback)
  }

  async batch (name = 'SCC', msg = 'test') {
    const topic = String(name)
    const dataBuffer = Buffer.from(msg)

    const [messageId] = await this.pubsub
      .topic(topic)
      .publisher({
        batching: {
          maxMessages: 1500
        } })
      .publish(dataBuffer)
    console.log(`Message ${messageId} published.`)
  }

  parse (data, context) {
    const pubSubMessage = data
    const msg = pubSubMessage.data
      ? Buffer.from(pubSubMessage.data, 'base64').toString('utf8')
      : 'No data. Resubmit'
    console.log(`PubSub message parsed: ${msg}`)
    return msg
  }
}

module.exports.telegram = new Telegram()
