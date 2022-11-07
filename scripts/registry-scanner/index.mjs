/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import  { promises as fs} from 'fs'
import { Octokit } from "@octokit/rest";
import { URL } from 'url';

// Before running this script set the GITHUB_AUTH_TOKEN as an environment variable,
// e.g.
// $ export GITHUB_AUTH_TOKEN=ghp_YOUR_TOKEN_HERE
// $ node index.mjs
const octokit = new Octokit({auth: process.env.GITHUB_AUTH_TOKEN});

// Please uncomment the entries you'd like to scan for.
// ['receiver','exporter','processor', 'extension'].forEach(async (component) => scanCollectorComponent(component))

// scanByLanguage('instrumentation', 'js', 'plugins/node')

scanByLanguage('instrumentation', 'ruby')
// scanByLanguage('exporter', 'ruby', 'exporter', 'md', 'opentelemetry-ruby');

// scanByLanguage('instrumentation', 'erlang', 'instrumentation')

//scanByLanguage('instrumentation', 'python', 'instrumentation', 'rst')
//scanByLanguage('exporter', 'python', 'exporter', 'rst', 'opentelemetry-python')


// scanByLanguage('instrumentation', 'java', 'instrumentation', 'md', 'opentelemetry-java-instrumentation')

/*[
    ['instrumentation', 'opentelemetry-dotnet'],
    ['instrumentation', 'opentelemetry-dotnet-contrib'],
    ['exporter', 'opentelemetry-dotnet'],
    ['exporter', 'opentelemetry-dotnet-contrib']
].forEach(async ([registryType, repo]) => {
    scanByLanguage(registryType, 'dotnet', 'src', 'md', repo, (item) => item.name.toLowerCase().includes(registryType), (name) => name.split(".").splice(2,3).join('-').toLowerCase())
})*/

async function scanForNew(path, repo, filter = () => true, keyMapper = x => x, owner = 'open-telemetry') {
    const result = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path
    })
    return result.data.reduce((carry, current) => {
        if(filter(current) && current.type === 'dir') {
            const key = keyMapper(current.name)
            carry[key] = current
        }
        return carry
    }, {})
}

async function scanForExisting(type, noDash = false) {
    const result = await octokit.request('GET /repos/open-telemetry/opentelemetry.io/contents/content/en/registry')
    return result.data.reduce((carry, current) => {
        if(current.name.startsWith(type)) {
            const name = current.name.substring(type.length+1,current.name.length-3).replaceAll('-','')
            carry[name] = current
        }
        return carry
    }, {})
}

function createMarkDown(shortName, title, language, registryType, repo, description) {
    return `---
title: ${title}
registryType: ${registryType}
isThirdParty: false
language: ${language}
tags:
    - ${shortName}
    - ${registryType}
    - ${language}
repo: ${repo}
license: Apache 2.0
description: ${description}
authors: OpenTelemetry Authors
otVersion: latest
---
`
}

function parseReadme(readme, format = 'md') {
    if(format === 'rst') {
        return readme.split('\n').reduce((result, line, index) => {
            if (!result.name && index === 0) {
                result.name = line
            }
            if (!result.description && index > 1 && /^[A-Za-z]/.test(line)) {
                result.description = line
            }
            return result
        }, {})
    }
    // Markdown (md) is the default
    return readme.split('\n').reduce((result, line) => {
        if (!result.name && line.startsWith('#')) {
            result.name = line.substring(1).trim()
        }
        if (!result.description && /^[A-Za-z]/.test(line)) {
            result.description = line
        }
        return result
    }, {})    
}

async function createFilesFromScanResult(existing, found, settings) {
    const { language, registryType, readmeFormat } = settings
    const result = Object.keys(found).forEach(async (currentKey) => {
        // Check if the entry does not exist already and create it if needed.
        if(!Object.keys(existing).includes(currentKey)) {
            const current = found[currentKey]
            let parsedReadme = {
                name: currentKey,
                description: ''
            }
            try {
                const result = await octokit.request(`GET ${(new URL(current.url).pathname)}/README.${readmeFormat}`)
                parsedReadme = parseReadme(Buffer.from(result.data.content, 'base64').toString(), readmeFormat)
            } catch(e) {
                console.warn(`Request error while fetching README.md for ${currentKey}: ${e.message}`)
            }
            const md = createMarkDown(currentKey, parsedReadme.name, language, registryType, current.html_url, parsedReadme.description)
            // collector entries are named reverse (collector-{registryTpe}) compared to languages ({registryTpe}-{language}), we fix this here.
            const fileName = language === 'collector' ? `${language}-${registryType}-${currentKey}.md` : `${registryType}-${language}-${currentKey}.md`
            await fs.writeFile(fileName, md)
        }
    })
}

async function scanByLanguage(
        registryType,
        language, 
        path = registryType, 
        readmeFormat = 'md', 
        repo = `opentelemetry-${language}-contrib`,
        filter = () => true,
        keyMapper = x => x.split(/[_-]/).filter(y => !['opentelemetry', registryType].includes(y)).join(''),
    ) {
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/
    const found = await scanForNew(path, repo, filter, keyMapper)
    const existing = await scanForExisting(`${registryType}-${language}`)
    createFilesFromScanResult(existing, found, {
        language,
        registryType,
        readmeFormat
    })
}


async function scanCollectorComponent(component) {
    const filter = (item) => item.name.endsWith(component)
    const keyMapper = (name) => name.substring(0, name.length - component.length)
    const found = Object.assign(await scanForNew(component, 'opentelemetry-collector', filter, keyMapper), await scanForNew(component, 'opentelemetry-collector-contrib', filter, keyMapper))
    const existing = await scanForExisting(`collector-${component}`, true)
    createFilesFromScanResult(existing, found, {
        language: 'collector',
        registryType: component,
        readmeFormat: 'md'
    })
}

