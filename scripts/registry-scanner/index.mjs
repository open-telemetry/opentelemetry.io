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
// ['receiver','exporter','processor'].forEach(async (component) => await scrapeCollectorComponent(component))
// scrapeInstrumentationLibrariesByLanguage('js', 'plugins/node')
// scrapeInstrumentationLibrariesByLanguage('ruby', 'instrumentation')
scrapeInstrumentationLibrariesByLanguage('python', 'instrumentation', 'rst')

async function scrapeNew(path, repo, filter = () => true, keyMapper = x => x, owner = 'open-telemetry') {
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

async function scrapeExisting(type, noDash = false) {
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

async function createFilesFromScrapeResult(existing, found, settings) {
    const { language, registryType, readmeFormat } = settings
    const result = Object.keys(found).forEach(async (currentKey) => {
        // Check if the entry does not exist already and create it if needed.
        if(!Object.keys(existing).includes(currentKey)) {
            const current = found[currentKey]
            const result = await octokit.request(`GET ${(new URL(current.url).pathname)}/README.${readmeFormat}`)
            const parsedReadme = parseReadme(Buffer.from(result.data.content, 'base64').toString(), readmeFormat)
            const md = createMarkDown(currentKey, parsedReadme.name, language, registryType, current.html_url, parsedReadme.description)
            // collector entries are named reverse (collector-{registryTpe}) compared to languages ({registryTpe}-{language}), we fix this here.
            const fileName = language === 'collector' ? `${language}-${registryType}-${currentKey}.md` : `${registryType}-${language}-${currentKey}.md`
            await fs.writeFile(fileName, md)
        }
    })
}

async function scrapeInstrumentationLibrariesByLanguage(language, path, readmeFormat = 'md') {
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/
    const keyMapper = x => x.split('-').filter(y => !['opentelemetry', 'instrumentation'].includes(y)).join('-')
    const found = await scrapeNew(path, `opentelemetry-${language}-contrib`, () => true, keyMapper)
    const existing = await scrapeExisting(`instrumentation-${language}`)
    createFilesFromScrapeResult(existing, found, {
        language,
        registryType: 'instrumentation',
        readmeFormat
    })
}

async function scrapeCollectorComponent(component) {
    const filter = (item) => item.name.endsWith(component)
    const keyMapper = (name) => name.substring(0, name.length - component.length)
    const found = Object.assign(await scrapeNew(component, 'opentelemetry-collector', filter, keyMapper), await scrapeNew(component, 'opentelemetry-collector-contrib', filter, keyMapper))
    const existing = await scrapeExisting(`collector-${component}`, true)
    createFilesFromScrapeResult(existing, found, {
        language: 'collector',
        registryType: component,
        readmeFormat: 'md'
    })
}

