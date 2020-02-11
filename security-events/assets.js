require('env-yaml').config()
const { Storage } = require('@google-cloud/storage')
const securityCenter = require('@google-cloud/security-center')
const { getJson, lru } = require('./util')

const sccClient = new securityCenter.SecurityCenterClient({
  keyFilename: 'scc_key.json'
})
const storage = new Storage()
const bucket = storage.bucket(process.env.BUCKET_NAME || `cloudflare-scc-bucket-${process.env.PROJECT_ID}`)

let assets = {
  Cloudflare: {},
  Google: {},
  Shared: {},
  file: {},

  set accountId (token) {
    lru.account.set('id', token)
  },

  get accountId () {
    if (lru.account.get('id')) {
      if (lru.account.get('id').length > 6) {
        return lru.account.get('id')
      }
    }
    return null
  },

  set zoneIds (arr) {
    lru.zones.set(arr[0], arr[1])
  },

  get zoneIds () {
    return Array.from(lru.zones.values())
  },

  getLbHosts: async function () {
    try {
      let response = await getJson({
        path: `/zones/${process.env.ZONE_ID}/load_balancers`
      })

      let hostPoolPairs = {}
      for (const host of response.result) {
        hostPoolPairs[`${host.name}`] = [].concat(...[
          Object.values(host.default_pools),
          Object.values(host.region_pools),
          Object.values(host.pop_pools),
          host.fallback_pool
        ])[0]
      }

      for (let [host, pool] of Object.entries(hostPoolPairs)) {
        let poolIp = await getJson({
          path: `/accounts/${this.accountId}/load_balancers/pools/${pool}`
        })
        this.Cloudflare[`${host}`] = poolIp.result.origins[0].address
      }
    } catch (e) {
      return 'caught'
    }
  },

  getDnsRecords: async function () {
    try {
      for (const zoneId of this.zoneIds) {
        console.log(zoneId)
        let records = ['A', 'AAAA', 'CNAME'].map(async recordType => {
          let response = await getJson({
            params: {
              type: recordType,
              match: 'any',
              per_page: '100',
              order: 'proxied'
            },
            path: `/zones/${zoneId}/dns_records`
          })
          if (response && response.result) {
            for (const host of response.result) {
              this.Cloudflare[`${host.name}`] = host.content
            }
          } else {
            console.log('Request failed')
          }
        })

        for (const record of records) {
          await record
        }
      }
    } catch (e) {
      return 'caught'
    }
  },

  getZoneIds: async function () {
    try {
      if (this.zoneIds && this.zoneIds.length > 0) {
        console.log('Got zone IDs from memory')
        return this.zoneIds
      }
      let response = await getJson({
        params: {
          'account.id': await this.getAccountId()
        },
        path: `/zones`
      })
      console.log('Retrieving zones ...')
      for (const zone of response.result) {
        this.zoneIds = [`${zone.name}`, zone.id]
      }

      return this.zoneIds
    } catch (e) {
      throw console.log(e)
    }
  },

  getAccountId: async function () {
    if (this.accountId && this.accountId !== '') {
      console.log('Got acct ID from memory')
      return this.accountId
    }
    try {
      let response = await getJson({
        params: {
          per_page: '50'
        },
        path: `/accounts`
      })

      for (const account of response.result) {
        if (account.name === process.env.CF_ORG_NAME) {
          this.accountId = account.id
          console.log(this.accountId)
          return this.accountId
        }
      }
    } catch (e) {
      return 'caught'
    }
  },

  getAllHosts: async function () {
    try {
      let hosts = Promise.all([
        this.getLbHosts(),
        this.getDnsRecords()
      ])
      return hosts
    } catch (e) {
      console.log('not all cloudflare resources retrieved')
      return 'caught'
    }
  },

  getGoogleResources: async function () {
    try {
      let resources = await sccClient.listAssets({
        parent: sccClient.organizationSettingsPath(process.env.SOURCE_ID),
        filter: `security_center_properties.resource_name:"address" OR security_center_properties.resource_name:"storage"`
      })
      console.log(resources)
      resources = (await resources)[0]

      let resourceId

      for (const resource of resources) {
        switch (resource.asset.securityCenterProperties.resourceType) {
          case 'google.compute.Address':
            resourceId = `${resource.asset.resourceProperties.address.stringValue}`
            this.Google[`${resource.asset.name}`] = resourceId
            break

          case 'google.cloud.storage.Bucket':
            resourceId = `${resource.asset.securityCenterProperties.resourceName}`
            resourceId = `${resourceId.split('/').pop()}`
            this.Google[`${resource.asset.name}`] = resourceId
            break

          default:
            break
        }
      }
    } catch (e) {
      return e
    }
  },

  updateAssetsFile: async function (filename = 'assets.json') {
    try {
      await bucket.get({ autoCreate: true })
      this.file = bucket.file(filename)
      for (const [host, origin] of Object.entries(this.Cloudflare)) {
        await Object.entries(this.Google).map(([sccAssetId, ip]) => {
          if (ip === origin) {
            this.Shared[`${host}`] = sccAssetId
          }
        })
      }

      let contents = {}
      Object.assign(contents, this.Cloudflare, this.Google, this.Shared)
      contents = JSON.stringify(contents, null, 2)
      this.file.save(contents, function (err) {
        if (!err) {
          console.log(`assets.json written to ${process.env.BUCKET_NAME || `cloudflare-scc-bucket-${process.env.PROJECT_ID}`}`)
        } else {
          console.log(err)
        }
      })
    } catch (e) {
      return 'caught'
    }
  },

  getAssetsFile: async function () {
    try {
      let file = await this.file.download()
      let assetIds = JSON.parse(file[0])
      return assetIds
    } catch (e) {
      return e
    }
  }
}

// (async () => { console.log(await Assets.getGoogleResources()) })()

module.exports = assets
