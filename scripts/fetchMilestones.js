import fs from 'fs'
import YAML from 'yaml'
import fetch from 'node-fetch'
const token = process.env.GH_TOKEN
const file = fs.readFileSync('./data/progress_source.yaml', 'utf8')
const data = YAML.parse(file)

const versions = data.columns.map(x => x.label)

async function getAllMilestones() {
  for (const x of data.data) {
    const baseUrl = x.sourceUrl.substring(19)
    const apiUrl = `https://api.github.com/repos/${baseUrl}/milestones`
    await fetch(apiUrl, {headers: { 'Authorization': `token ${token}`}}).then(res => res.json()).then(body => {
      let matches = []
      if (body.length > 1) {
        body.filter(i => versions.some(v => {
          if (i.title) {
            if (i.title.includes(v)) {
              i.msLabel = v
              matches.push(i)
            }
          }
        }))
      } else {
        if (body.title) {
          versions.some(v => {
            if (body.title.includes(v))
            {
              body.msLabel = v
              matches.push(body)
            }
          })
        }
      }
      if (matches.length > 0) {
        x.msLabel = matches[0].msLabel
        x.openIssues = matches[0].open_issues
        x.closedIssues = matches[0].closed_issues
        if (x.openIssues + x.closedIssues === 0) {
          x.totalIssues = 0
        } else {
          x.totalIssues = (matches[0].open_issues + matches[0].closed_issues).toFixed(1)
        }
      }
    }).catch(err => console.error(err))
  }
}

async function main() {
  if (token === undefined || token.length === 0)
  {
    console.error("please set GH_TOKEN, exiting")
    process.exit(1)
  }
  await getAllMilestones()
  const finalYaml = YAML.stringify(data)
  fs.writeFileSync('./data/progress_generated.yaml', finalYaml)
}

main();
