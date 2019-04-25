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

const vinyl = require('vinyl-fs')
const fs = require('fs-extra')
const replace = require('gulp-frep')
const yargsInteractive = require('yargs-interactive')
const bach = require('bach')
const child = require('child_process')
const download = require('download-git-repo')
const chalkPipe = require('chalk-pipe')

const del = require('del')
const yaml = {
  read: require('read-yaml'),
  write: require('write-yaml')
}

exports.handler = async (argv) => {
  const { info, success, err } = require('../utils/logger')
  const { baseDir, envDir, deploymentDir } = require('../utils/paths')
  const GCP = {
    GCLOUD_ORG: '',
    PROJECT_ID: '',
    ENV () {
      try {
        try {
          fs.accessSync(envDir, fs.constants.R_OK | fs.constants.W_OK)
        } catch (err) {
          this.PROJECT_ID = JSON.parse(child.execSync('gcloud config list --format "json(core.project)"').toString()).core.project
          this.GCLOUD_ORG = child.execSync(`gcloud projects list --filter project_id=${this.PROJECT_ID} --format=json`).toString()
          this.GCLOUD_ORG = JSON.parse(this.GCLOUD_ORG)[0].parent.id
          console.log(envDir)
          yaml.write.sync(envDir, { PROJECT_ID: this.PROJECT_ID, GCLOUD_ORG: this.GCLOUD_ORG })
        } finally {
          const readEnv = yaml.read.sync(envDir)
          this.PROJECT_ID = readEnv.PROJECT_ID
          this.GCLOUD_ORG = readEnv.GCLOUD_ORG
        }
      } catch (e) {
        console.log('45')
        return err(e)
      }
      success(`Connected to ${this.PROJECT_ID} in org ${this.GCLOUD_ORG}`)
    }
  }

  function fn1 (cb) {
    del.sync([`deployment`, `dist/**`])
    cb(null, 1)
  }

  // function fn2 (cb) {
  //   download('shagamemnon/security-events-serverless', 'deployment', function (err) {
  //     if (err) throw err
  //     success('Remote repository downloaded')
  //     cb(null, 0)
  //   })
  // }

  function fn2 (cb) {
    GCP.ENV()
    cb(null, 1)
  }

  function fn3 (cb) {
    let prompts = yaml.read.sync(`templates/prompts.yml`)
    let options = {
      interactive: { default: true }
    }

    function * setExample () {
      yield 'Example: cloudflare-security-admin'
      yield 'Example: cloudflare-logs-bucket'
      yield 'Example: myproject:cflogs_table.recent_events'
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
      yaml.write.sync(envDir, {
        PROJECT_ID: `${GCP.PROJECT_ID}`,
        GCLOUD_ORG: `${GCP.GCLOUD_ORG}`,
        CREDENTIALS: `./scc_key.json`,
        BUCKET_NAME: answers.BUCKET_PROMPT.replace('Example: ', ''),
        BQ_DATASET: answers.BQ_PROMPT.replace('Example: ', ''),
        SERVICE_ACCOUNT: answers.SERVICE_PROMPT.replace('Example: ', ''),
        BASE_DIR: baseDir,
        DEPLOYMENT_DIR: deploymentDir
      }, { spaces: 2 })
      success(`\n\nService Account Key created and environment variables set. To modify this file, use ... \n$ cfse setEnv \n--or-- \n$ nano ${envDir}\n\n${fs.readFileSync(envDir)}`)
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

  function fn4 (cb) {
    require('env-yaml').config({ path: envDir })
    const patterns = [
      {
        pattern: /SERVICE_ACCOUNT/g,
        replacement: `${process.env.SERVICE_ACCOUNT}`
      },
      {
        pattern: /PROJECT_ID/g,
        replacement: `${GCP.PROJECT_ID}`
      },
      {
        pattern: /BUCKET_NAME/g,
        replacement: `${process.env.BUCKET_NAME}`
      },
      {
        pattern: /BQ_DATASET/g,
        replacement: `${process.env.BQ_DATASET}`
      },
      {
        pattern: /GCLOUD_ORG/g,
        replacement: `${GCP.GCLOUD_ORG}`
      },
      {
        pattern: /DEPLOYMENT_DIR/g,
        replacement: `${deploymentDir}`
      },
      {
        pattern: /BASE_DIR/g,
        replacement: `${baseDir}`
      }
    ]
    setTimeout(function () {
      try {
        vinyl.src(`templates/*.yml`)
          .pipe(replace(patterns))
          .pipe(vinyl.dest(`dist`))
      } catch (e) {
        err(e)
      } finally {
        cb(null, 5)
      }
    }, 1000)
  }

  return bach.settleSeries(fn1, fn2, fn3, fn4)()
}

exports.command = 'setEnv'

exports.describe = 'Set environment variables'

exports.builder = {
  dir: {
    default: '.'
  }
}
