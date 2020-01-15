require('env-yaml').config()
const { Storage } = require('@google-cloud/storage')
const securityCenter = require('@google-cloud/security-center')
const cloudflareClient = require('./cloudflare')

const sccClient = new securityCenter.SecurityCenterClient({
  keyFilename: 'scc_key.json'
})
const storage = new Storage()
const bucket = storage.bucket(process.env.BUCKET_NAME)

let Assets = {
  Cloudflare: {},
  Google: {},
  Shared: {},
  file: {},
  accountId: '',
  zoneIds: [],

  getLbHosts: async () => {
    try {
      let response = await cloudflareClient.getJson({
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
        let poolIp = await cloudflareClient.getJson({
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
      let records = ['A', 'AAAA', 'CNAME'].map(async recordType => {
        let response = await cloudflareClient.getJson({
          params: {
            type: recordType,
            match: 'any',
            per_page: '100',
            order: 'proxied'
          },
          path: `/zones/${process.env.ZONE_ID}/dns_records`
        })

        for (const host of response.result) {
          this.Cloudflare[`${host.name}`] = host.content
        }
        await this.Cloudflare
      })

      for (const record of records) {
        await record
      }
    } catch (e) {
      return 'caught'
    }
  },

  getZoneIds: async function () {
    let response = await cloudflareClient.getJson({
      params: {
        'account.id': this.accountId
      },
      path: `/zones`
    })
    for (const zone of response.result) {
      this.zoneIds.push(zone.id)
    }
    console.log(this.zoneIds)
  },

  getAccountId: async function () {
    try {
      let response = await cloudflareClient.getJson({
        params: {
          per_page: '50'
        },
        path: `/accounts`
      })

      for (const account of response.result) {
        if (account.name === process.env.CF_ORG_NAME) {
          this.accountId = account.id
          return Assets
        }
        continue
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
        parent: sccClient.organizationPath(process.env.GCLOUD_ORG),
        filter: `security_center_properties.resource_name:"address" OR security_center_properties.resource_name:"storage"`
      })

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
          console.log(`assets.json written to ${process.env.BUCKET_NAME}`)
          return Assets
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

module.exports = Assets
