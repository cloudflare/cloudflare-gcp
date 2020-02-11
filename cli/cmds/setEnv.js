/**
 *
 *
 *
 *
 * Setup environment variables and write to .env.yaml
 *
 *
 *
 */

const fs = require('fs-extra')
const yargsInteractive = require('yargs-interactive')
const bach = require('bach')
const child = require('child_process')
const chalkPipe = require('chalk-pipe')
const del = require('del')
const yaml = {
  read: require('read-yaml'),
  write: require('write-yaml')
}
const { info, success, err } = require('../utils/logger')
const { baseDir, envDir, deploymentDir } = require('../utils/paths')

exports.command = 'setEnv'

exports.describe = 'Set environment variables'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  const GCP = {
    GCLOUD_ORG: '',
    PROJECT_ID: '',
    ENV () {
      try {
        this.PROJECT_ID = JSON.parse(child.execSync('gcloud config list --format "json(core.project)"').toString()).core.project
        this.GCLOUD_ORG = JSON.parse(child.execSync(`gcloud projects list --filter project_id=deep-presence-139721 --format=json`).toString())[0].parent.id
        yaml.write.sync(envDir, { PROJECT_ID: this.PROJECT_ID, GCLOUD_ORG: this.GCLOUD_ORG })
        success(`Connected to ${this.PROJECT_ID} in org ${this.GCLOUD_ORG}`)
      } catch (e) {
        return err(e)
      } finally {
        const readEnv = yaml.read.sync(envDir)
        this.PROJECT_ID = readEnv.PROJECT_ID
        this.GCLOUD_ORG = readEnv.GCLOUD_ORG
      }
    }
  }

  function fn1 (cb) {
    del.sync([`deployment`, `confs/**`])
    cb(null, 1)
  }

  function fn2 (cb) {
    GCP.ENV()
    cb(null, 1)
  }

  function fn3 (cb) {
    let prompts = yaml.read.sync(`${baseDir}/templates/setEnvPrompts.yml`)
    let options = {
      interactive: { default: true }
    }

    function * setExample () {
      yield `Example: Acme Corp`
      yield `Example: YQSn-xWAQiiEh9qM58wZNnyQS7FUdoqGIUAbrh7T`
      yield `Example: cloudflare-security-admin@${GCP.PROJECT_ID || 'PROJECT_ID'}@iam.gserviceaccount.com`
      yield `Example: organizations/12345678901/sources/112233445566778899abc`
      yield `Default: 10m`
      yield `Default: us-central1`
    }
    let ex = setExample()

    for (let prompt in prompts) {
      Reflect.set(options, `${prompt}`, prompts[prompt])
      prompts[prompt].suffix = `\n`
      prompts[prompt].default = ex.next().value
      prompts[prompt].transformer = function (example) {
        return chalkPipe(example)(example)
      }
    }

    function writeEnv (answers) {
      let envs = {
        PROJECT_ID: `${GCP.PROJECT_ID}`,
        GCLOUD_ORG: GCP.GCLOUD_ORG,
        CREDENTIALS: `./scc_key.json`,
        CF_ORG_NAME: answers.CF_ORG_NAME_PROMPT.replace('Example: ', ''),
        API_KEY: answers.API_KEY_PROMPT.replace('Example: ', ''),
        SERVICE_ACCOUNT: answers.SERVICE_PROMPT.replace('Example: ', '').trim().replace(`\t`, ''),
        SOURCE_ID: answers.SRCID_PROMPT.replace('Example: ', '').trim().replace(`\t`, ''),
        INTERVAL: answers.INTERVAL_PROMPT.replace('Default: ', ''),
        REGION: answers.REGION_PROMPT.replace('Default: ', ''),
        BASE_DIR: baseDir,
        DEPLOYMENT_DIR: deploymentDir
      }

      yaml.write.sync(envDir, envs, { spaces: 2 })
      success(`\n\nService Account Key created and environment variables set. To modify this file, use \n\n$ nano ${envDir}\n\n${fs.readFileSync(envDir)}`)
      // del.sync([`confs/setEnvPrompts`])
      info(`Project: ${GCP.PROJECT_ID}, Org: ${GCP.GCLOUD_ORG}`)
      success(`Click next -->`)
      cb(null, 2)
    }

    yargsInteractive()
      .usage('$0 <command> [args]')
      .interactive(options)
      .then(result => writeEnv(result))
      .catch(e => {
        if (e) err(e)
      })
  }

  return bach.settleSeries(fn1, fn2, fn3)()
}
