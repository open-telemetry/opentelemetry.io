import  { promises as fs} from 'fs'
import { Octokit } from "@octokit/rest";
import { URL } from 'url';

const auth = process.env.GITHUB_AUTH_TOKEN;

const octokit = new Octokit({auth});

async function scrapeNew(path, repo, filter = () => true, keyMapper = x => x, owner = 'open-telemetry') {
    const result = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path
    })  
    return result.data.reduce((carry, current) => {
        if(filter(current)) {
            const key = keyMapper(current.name)
            carry[key] = current
        }
        return carry
    }, {})
}

async function scrapeExisting(type, noDash = false) {
    const result = await octokit.request('GET /repos/open-telemetry/opentelemetry.io/contents/content/en/registry')
    return result.data.reduce((carry, current) => {
        if(current.name.startsWith(type)) {
            const name = current.name.substring(type.length+1,current.name.length-3).replaceAll('-','')
            carry[name] = current
        }
        return carry
    }, {})
    return result
}

function createMarkDown(title, registryType, repo, description) {
    return `---
title: ${title}
registryType: ${registryType}
isThirdParty: false
language: collector
tags:
    - go
    - ${registryType}
    - collector
repo: ${repo}
license: Apache 2.0
description: ${description}
authors: OpenTelemetry Authors
otVersion: latest
---
`
}

async function scrapeCollectorComponent(component) {
    const filter = (item) => item.name.endsWith(component)
    const keyMapper = (name) => name.substring(0, name.length - component.length)
    const coreAndContrib = Object.assign(await scrapeNew(component, 'opentelemetry-collector', filter, keyMapper), await scrapeNew(component, 'opentelemetry-collector-contrib', filter, keyMapper))
    const existing = await scrapeExisting(`collector-${component}`, true)

    // Create New Entries
    const result = Object.keys(coreAndContrib).reduce(async (carry, currentKey) => {
        // Check if the entry does not exist already and create it if needed.
        if(!Object.keys(existing).includes(currentKey)) {
            const current = coreAndContrib[currentKey]
            const result = await octokit.request(`GET ${(new URL(current.url).pathname)}/README.md`)
            const readme = Buffer.from(result.data.content, 'base64').toString();
            const parsedReadme = readme.split('\n').reduce((result,line) => {
                 if(!result.name && line.startsWith('#')) { 
                    result.name = line.substring(1).trim() 
                } 
                 if (!result.description && /^[A-Za-z]/.test(line)) { result.description = line  } return result }, {})
            const md = createMarkDown(parsedReadme.name, component, current.html_url, parsedReadme.description)
            carry[currentKey] = await fs.writeFile(`collector-${component}-${currentKey}.md`, md);
        }
        return carry
    }, [])
    return result

    // To be done: Delete Outdated Entries
}

['receiver','exporter','processor'].forEach(async (component) => await scrapeCollectorComponent(component))
