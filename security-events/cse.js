'use strict'

require('env-yaml').config()
process.env.GOOGLE_APPLICATION_CREDENTIALS = './scc_key.json'
const { BigQuery } = require('@google-cloud/bigquery')
const { Storage } = require('@google-cloud/storage')
const fs = require('fs-extra')
const LRU = require('quick-lru')
const SC = require('@google-cloud/security-center')
const securityCenter = new SC.v1beta1.SecurityCenterClient({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.CREDENTIALS
})
const storage = new Storage()
const { execSync } = require('child_process')

const bigquery = new BigQuery({
  projectId: (process.env.BQ_DATASET).split(':')[0]
})

const { info, success, err } = require('./logger')
const fields = require('./static/fields.json')

const lru = new LRU({
  maxSize: 200
})

const cacheHandler = {
  get (target, prop, receiver) {
    return Reflect.get(...arguments)
  },
  set (obj, prop, value) {
    return Reflect.set(...arguments)
  }
}

const Cache = {
  colos: new Proxy(lru, cacheHandler),
  assets: new Proxy(lru, cacheHandler),
  get rationales () {
    let outcomes = fields
    outcomes = Array.from([outcomes.EdgePathingStatus, outcomes.EdgePathingSrc])
    outcomes = new Map(Object.entries(outcomes[0]))
    return outcomes
  }
}

class CSE {
  constructor ({ orgPath, source }) {
    this.orgPath = orgPath
    this.source = source
    this._assets = [this.orgPath]
    this.finding = {}
    this.rationale = Cache.rationales
    this.newRows = 100
  }

  get assets () {
    return this._assets
  }

  set assets (asset) {
    if (asset.length > 3) this._assets.push(asset)
  }

  listFindings () {
    let $this = this
    securityCenter.listFindingsStream({
      parent: this.source
    })
      .on('data', element => {
        info(JSON.stringify(element, null, 2))
        console.log(this)
        return $this
      }).on('error', err => {
        console.log(err)
      })
  }

  formatFinding (log) {
    this.assets = log.OriginIP
    console.log(log)

    this.finding = {
      name: `${this.source}/findings/${log.RayID}`,
      externalUri: `https://dash.cloudflare.com/`,
      state: 'ACTIVE',
      resourceName: this.assets[0] || this.orgPath,
      category: 'Cloudflare Firewall Event',
      sourceProperties: {
        Action: {
          stringValue: log.EdgePathingStatus,
          kind: 'stringValue'
        },
        Status: {
          stringValue: `${log.EdgeResponseStatus}`,
          kind: 'stringValue'
        },
        Host: {
          stringValue: log.ClientRequestHost,
          kind: 'stringValue'
        },
        URI: {
          stringValue: `${log.ClientRequestMethod} ${log.ClientRequestURI}`,
          kind: 'stringValue'
        },
        Country: {
          stringValue: log.ClientCountry.toUpperCase(),
          kind: 'stringValue'
        },
        Location: {
          stringValue: CSE.getColo(log.EdgeColoID),
          kind: 'stringValue'
        },
        ClientIP: {
          stringValue: log.ClientIP,
          kind: 'stringValue'
        },
        ClientASN: {
          stringValue: log.ClientASN,
          kind: 'stringValue'
        },
        Device: {
          stringValue: log.ClientDeviceType,
          kind: 'stringValue'
        },
        EdgePathingSignature: {
          stringValue: `${log.EdgePathingStatus} ${log.EdgePathingSrc}`
        },
        ClientRequestBytes: {
          stringValue: log.ClientRequestBytes,
          kind: 'stringValue'
        },
        ClientSSLCipher: {
          stringValue: log.ClientSSLCipher,
          kind: 'stringValue'
        },
        UA: {
          stringValue: log.ClientRequestUserAgent,
          kind: 'stringValue'
        },
        Referer: {
          stringValue: log.ClientRequestReferer,
          kind: 'stringValue'
        }
      },
      securityMarks: {
        OriginIP: log.OriginIP
      }
    }

    switch (true) {
      case log.EdgeResponseStatus === 429:
        this.finding.category = 'Block: Rate Limit'
        break

      case log.EdgePathingSrc === 'filterBasedFirewall':
        this.finding.category = `Firewall Rules: ${fields.EdgePathingStatus[log.EdgePathingStatus]}`
        break

      case log.WAFRuleMessage && log.WAFRuleMessage !== 'undefined':
        this.finding.category = log.WAFRuleMessage
        this.finding.sourceProperties.WAFAction = log.WAFAction
        this.finding.sourceProperties.WAFProfile = log.WAFProfile
        this.finding.sourceProperties.Action = {
          stringValue: log.WAFAction,
          kind: 'stringValue'
        }
        break

      default:
        const rationales = [log.EdgePathingStatus, log.EdgePathingSrc]
        let i = 0
        while (i < rationales.length) {
          const ratch = rationales[i]
          if (this.rationale.has(ratch)) {
            this.finding.category = this.rationale.get(ratch)
            break
          }
          i++
        }
    }

    if (this.finding.category.length < 3) {
      this.finding.category = `Cloudflare Firewall Event`
    }

    if (this.finding.category === undefined) {
      this.finding.category = `Cloudflare Firewall Event`
    }

    if (this.finding.resourceName.length < 3) {
      this.finding.resourceName = this.orgPath
    }

    if (this.finding.resourceName === undefined) {
      this.finding.resourceName = this.orgPath
    }

    // let eventTime = Date.parse(log.EdgeStartTimestamp.value)
    // console.log(eventTime.toString().slice(0, 10))

    this.finding.eventTime = {
      seconds: Number.parseInt(`${Date.now().toString().slice(0, 10)}`),
      nanos: Number.parseInt(`${Date.now().toString().slice(0, 9)}`)
    }

    return this
  }

  // Map EdgeColoID to the city where the colo resides
  static getColo (edgeColoID) {
    let id = Number.parseInt(edgeColoID, 10)
    let colos = require('./static/colos.json')
    let inCache = Cache.colos.has(edgeColoID)

    if (!inCache) {
      if (edgeColoID <= 172) {
        Cache.colos.set(edgeColoID, String(colos[id].colo_alias))
        return Cache.colos.get(edgeColoID)
      }

      const inChina = colos.slice(172).findIndex(colo => colo.colo_id === edgeColoID)

      if (inChina > -1) {
        Cache.colos.set(edgeColoID, String(colos[id].colo_alias))
        return Cache.colos.get(edgeColoID)
      }

      return 'San Francisco, CA'
    }
    return Cache.colos.get(edgeColoID)
  }

  update () {
    let fieldMask = {
      mask: 'attribute.sourceProperties,attribute.resourceName,attribute.eventTime,attribute.securityMarks'
    }
    info('update() called')
    console.log(this.finding)
    securityCenter.updateFinding({
      finding: this.finding
    }).then(responses => {
      const outcome = responses[0].name
      success(outcome)
      // success(this.finding.name)
      return outcome
    }).catch(e => {
      err(e)
    })
    return this.done()
  }

  done (prom) {
    const $that = this
    let done
    try {
      (async (done = false) => {
        await prom
        return done
      })(done)
    } catch (e) {
      err(e)
    } finally {
      done = true
    }
    if (done) return $that
    // row is a result from your query.
  }

  async rowsToStream () {
    let bq = (process.env.BQ_DATASET).split(':').pop().split('.')
    let dataset = bigquery.dataset(bq[0])
    this.count = {
      rowCount: [''].length,
      get newRowCount () {
        return this.rowCount
      },
      set newRowCount (tbl) {
        tbl.getMetadata((err, metadata, apiResponse) => {
          if (err) {
            // console.log(err)
            return 0
          }
          this.rowCount = parseInt(metadata.numRows, 10)
          console.log(this.rowCount)
        })
      }
    }

    this.count.newRowCount = dataset.table(bq[1])
    let bucket = storage.bucket(process.env.BUCKET_NAME)
    let file = bucket.file('tableMeta.json')
    let exists = await file.exists()

    if (!exists) {
      execSync(`gsutil cp tableMeta.json gs://${process.env.BUCKET_NAME}/`)
    }

    let numFile = await file.download()
    numFile = JSON.parse(numFile[0])
    numFile.numRows = `${numFile.numRows < 100 ? numFile.numRows = 100 : numFile.numRows}`

    if (isNaN(this.count.newRowCount)) this.count.newRowCount = [''].length
    if (isNaN(numFile.numRows)) numFile.numRows = [''].length

    const difference = (a, b) => Math.abs(a - b)

    numFile.numRows = difference(this.count.newRowCount, numFile.numRows)

    return file.save(JSON.stringify(numFile), function (err) {
      if (!err) {
        console.log(`Rows to search:`, parseInt(numFile.numRows))
        return numFile.numRows
        // File written successfully.
      }
    })
  }

  async addFindings ({
    queries = ['./static/queries/threats.txt']
  }) {
    const $that = this
    this.newRows = await this.rowsToStream()
    console.log(this.newRows)

    const runQueries = queries.map(async qry => {
      qry = fs.readFileSync(qry)
      qry = `${qry}`.replace('BQ_DATASET', (process.env.BQ_DATASET).split(':')[1])
      info(`Running query: ${qry}`)

      await bigquery.createQueryStream({ query: qry, maxResults: this.newRows })
        .on('error', console.error)
        .on('data', (row) => {
          $that.formatFinding(row).update()
        })
        .on('end', () => {
          success('Waiting on response from SCC ...')
        })
    })

    for (const runQuery of runQueries) {
      console.log(await runQuery)
    }
  }

  assetsStream () {
    console.log(Cache.assets.keys())
    securityCenter.listAssetsStream({
      parent: this.orgPath,
      filter: `securityCenterProperties.resourceType="google.compute.Address"`
    })
      .on('data', elem => {
        Cache.assets.set(elem.asset.securityCenterProperties.resourceName, elem.asset.resourceProperties.address.stringValue)
        console.log(Cache.assets.get(elem.asset.securityCenterProperties.resourceName))
        // doThingsWith(element)
      }).on('error', err => {
        console.log(err)
      })
  }

  static init () {
    const orgPath = securityCenter.organizationPath(`${process.env.GCLOUD_ORG}`)
    console.log(orgPath)
    return new CSE({
      orgPath: orgPath,
      source: `organizations/1065635207347/sources/9511806194854963812`
    })
    // securityCenter.listSources({
    //   parent: orgPath
    // }).then(sources => {
    //   sources = sources[0]
    //   // let sources = 'organizations/1065635207347/sources/9511806194854963812'
    //   console.log(sources)

    //   let getSource = sources.filter(src => src.displayName === 'Cloudflare')
    //   // if (getSource[0] !== 'Cloudflare') {
    //   //   getSource = await securityCenter.createSource({
    //   //     parent: orgPath,
    //   //     source: {
    //   //       displayName: 'Cloudflare'
    //   //     }
    //   //   })
    //   //   sources = sources[0]
    //   // } else {
    //   //   sources = getSource[0]
    //   // }

    //   info(`Using source ${sources.displayName} in o${orgPath}`)
    //   return new CSE({
    //     orgPath: orgPath,
    //     source: sources.name || `organizations/1065635207347/sources/9511806194854963812`
    //   })
    // })
  }
}

module.exports = CSE
