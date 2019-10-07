import fs from 'fs'
import YAML from 'yaml'
import fetch from 'node-fetch'
const token = process.env.GH_TOKEN
const file = fs.readFileSync('./data/progress_source.yaml', 'utf8')
const sourceFileData = YAML.parse(file)

const versions = sourceFileData.columns.map(x => x.label)
const labelData = sourceFileData.data

function checkIfMilestoneMatchesVersion(version, milestone) {
  if (milestone.title && milestone.title.toLowerCase().includes(version)) {
    return true
  } else {
    return false
  }
}

function updateDataWithMilestoneInfo(data, milestoneLabel, milestone) {
  data.msLabel = milestoneLabel
  data.openIssues = milestone.open_issues
  data.closedIssues = milestone.closed_issues
  if (data.openIssues + data.closedIssues === 0) {
    data.totalIssues = 0
  } else {
    data.totalIssues = (data.openIssues + data.closedIssues).toFixed(1)
  }
}

async function fetchMilestoneDataForData(data) {
  const baseUrl = data.sourceUrl.substring(19)
  const apiUrl = `https://api.github.com/repos/${baseUrl}/milestones`
  const response = await fetch(apiUrl, { headers: { 'Authorization': `token ${token}` }})
  const resJson = await response.json()
  return resJson
}

function findMilestone(data, milestones) {
  for (const version of versions) {
    let found = false
    for (let ms of milestones) {
      if (checkIfMilestoneMatchesVersion(version, ms)) {
        updateDataWithMilestoneInfo(data, version, ms)
        found = true
        break;
      }
    }
    if (found) {
      break;
    }
  }
}

async function main() {
  if (token === undefined || token.length === 0)
  {
    console.error("please set GH_TOKEN, exiting")
    process.exit(1)
  }

  for (const datum of labelData) {
    await fetchMilestoneDataForData(datum)
      .then(msData => findMilestone(datum, msData))
  } 

  const finalYaml = YAML.stringify(sourceFileData)
  fs.writeFileSync('./data/progress_generated.yaml', finalYaml)
}

main();
