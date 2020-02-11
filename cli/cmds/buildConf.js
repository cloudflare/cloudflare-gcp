const { info, success, err } = require('../utils/logger')
const { baseDir, envDir, deploymentDir } = require('../utils/paths')
const vinyl = require('vinyl-fs')
const replace = require('gulp-frep')
const fs = require('fs-extra')
const del = require('del')

require('env-yaml').config({ path: envDir })

exports.command = 'buildConf'

exports.describe = 'Build or rebuild configuration files after changing .env.yml'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  const patterns = [
    {
      pattern: /SERVICE_ACCOUNT/g,
      replacement: `${process.env.SERVICE_ACCOUNT}`
    },
    {
      pattern: /PROJECT_ID/g,
      replacement: `${process.env.PROJECT_ID}`
    },
    {
      pattern: /SOURCE_ID/g,
      replacement: `${process.env.SOURCE_ID}`
    },
    {
      pattern: /BUCKET_NAME/g,
      replacement: `${process.env.BUCKET_NAME}`
    },
    {
      pattern: /REGION/g,
      replacement: `${process.env.REGION}`
    },
    {
      pattern: /DEPLOYMENT_DIR/g,
      replacement: `${deploymentDir}`
    },
    {
      pattern: /BASE_DIR/g,
      replacement: `${baseDir}`
    },
    {
      pattern: /GCLOUD_ORG/g,
      replacement: `${process.env.SOURCE_ID}`.split('/')[1]
    },
    {
      pattern: /\*.*\s\*\s\*\s\*\s*\s\*/gi,
      replacement: `*/${process.env.INTERVAL.replace('m', '')} * * * *`
    }
  ]
  setTimeout(function () {
    try {
      vinyl.src([`templates/*.yml`, `!templates/setEnvPrompts.yml`])
        .pipe(replace(patterns))
        .pipe(vinyl.dest(`confs`))
    } catch (e) {
      throw err(e)
    } finally {
      success(`\n\nService Account Key created and environment variables set. To modify this file, use \n\n$ nano ${envDir}\n\n${fs.readFileSync(envDir)}`)
      info(`Project: ${process.env.PROJECT_ID}, Org: ${process.env.GCLOUD_ORG}`)
      success(`Click next -->`)
    }
  }, 1500)
}
