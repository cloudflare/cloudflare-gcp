require('env-yaml').config()

const securityCenter = require('@google-cloud/security-center')
const sccClient = new securityCenter.SecurityCenterClient({
  keyFilename: 'scc_key.json'
})
const { getColo } = require('./util')

const format = {
  async qraphQL (log, asset) {
    if ('err' in log) {
      return console.log(log)
    }

    let category
    if ('source' in log && 'rule_id' in log) {
      category = `${log.source} - ${log.rule_id}`
    } else if ('source' in log) {
      category = log.source
    } else {
      category = 'Cloudflare'
    }

    if (!asset) {
      asset = log.host
    }

    let eventTime = new Date(log.occurred_at)
    console.log(`Logging finding ... ${process.env.SOURCE_ID}/findings/${log.ray_id}`)

    let finding = {
      updateMask: {
        paths: ['event_time', 'source_properties']
      },
      name: `${process.env.SOURCE_ID.replace('\t', '')}/findings/${log.ray_id}`,
      externalUri: `https://dash.cloudflare.com/firewall`,
      state: 'ACTIVE',
      resourceName: asset,
      category: category,
      eventTime: {
        seconds: Math.floor(eventTime.getTime() / 1000),
        nanos: (eventTime.getTime() % 1000) * 1e6
      },
      sourceProperties: {
        Action: {
          stringValue: log.action,
          kind: 'stringValue'
        },
        Source: {
          stringValue: log.source,
          kind: 'stringValue'
        },
        Country: {
          stringValue: log.country,
          kind: 'stringValue'
        },
        Protocol: {
          stringValue: log.proto,
          kind: 'stringValue'
        },
        Method: {
          stringValue: log.method,
          kind: 'stringValue'
        },
        Host: {
          stringValue: log.host,
          kind: 'stringValue'
        },
        Agent: {
          stringValue: log.ua,
          kind: 'stringValue'
        },
        Path: {
          stringValue: log.uri,
          kind: 'stringValue'
        },
        Location: {
          stringValue: getColo(log.EdgeColoID),
          kind: 'stringValue'
        },
        Rule: {
          stringValue: log.rule_id,
          kind: 'stringValue'
        }
      }
    }
    await sccClient.updateFinding({ finding })
    await sccClient.updateSecurityMarks({
      securityMarks: {
        name: `${finding.name}/securityMarks`,
        marks: { host: `${log.host}` }
      }
    })
  },

  async els (log) {
    if ('err' in log) {
      return console.log(log)
    }

    console.log(`Logging finding ... ${process.env.SOURCE_ID}/findings/${log.RayID}`)

    let finding = {
      updateMask: {
        paths: ['source_properties']
      },
      name: `${process.env.SOURCE_ID.replace('\t', '')}/findings/${log.RayID}`,
      externalUri: `https://dash.cloudflare.com/firewall`,
      state: 'ACTIVE',
      category: `firewallRules - ${log.FirewallMatchesRuleIDs[0]}`,
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
          stringValue: getColo(log.EdgeColoID),
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
        finding.category = 'Block: Rate Limit'
        break

      case log.WAFRuleMessage && log.WAFRuleMessage !== 'undefined':
        finding.category = log.WAFRuleMessage
        finding.sourceProperties.WAFAction = {
          stringValue: log.WAFAction,
          kind: 'stringValue'
        }
        finding.sourceProperties.WAFProfile = {
          stringValue: log.WAFProfile,
          kind: 'stringValue'
        }
        finding.sourceProperties.Action = {
          stringValue: log.WAFAction,
          kind: 'stringValue'
        }
        break

      default:
        break
    }

    finding.eventTime = {
      seconds: Number.parseInt(`${Date.now().toString().slice(0, 10)}`),
      nanos: Number.parseInt(`${Date.now().toString().slice(0, 9)}`)
    }
    await sccClient.updateFinding({ finding })
    await sccClient.updateSecurityMarks({
      securityMarks: {
        name: `${finding.name}/securityMarks`,
        marks: { host: `${log.ClientRequestHost}` }
      }
    })
  }
}

module.exports.findings = { format }
