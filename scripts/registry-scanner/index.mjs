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
import process from 'process';
import path from 'path';
import { promises as fs } from 'fs';
import { Octokit } from '@octokit/rest';
import { URL } from 'url';
import fetch from 'node-fetch';
import { load as cheerioLoad } from 'cheerio';

// Before running this script set the GITHUB_AUTH_TOKEN as an environment variable,
// e.g.
// $ export GITHUB_AUTH_TOKEN=ghp_YOUR_TOKEN_HERE
// $ node index.mjs
const octokit = new Octokit({ auth: process.env.GITHUB_AUTH_TOKEN });

// Some components should not be listed in the registry, you can remove them here
// by providing the file name that would be used for their entry.
const ignoreList = [
  // Internal to ruby, used by other OTLP exporters
  'exporter-ruby-otlpcommon.yml',
  // Sub modules (kafka clients, server, ...) are listed 1-by-1
  'instrumentation-java-kafka.yml',
  'instrumentation-java-akka.yml',
  // bunch of Java internals
  'instrumentation-java-annotations',
  'instrumentation-java-api.yml',
  'instrumentation-java-cditesting.yml',
  'instrumentation-java-extensionannotations.yml',
  'instrumentation-java-externalannotations.yml',
  'instrumentation-java-internal.yml',
  'instrumentation-java-methods.yml',
  'instrumentation-java-resources.yml',
];

if (process.argv.length < 3) {
  console.log(
    `USAGE: ${path.basename(process.argv[0])} ${path.basename(
      process.argv[1]
    )} <list>
    <list> is a comma separated list of the following options: 
        - collector
        - python
        - ruby
        - erlang
        - java
        - js
        - dotnet
	      - php
        - go
    Use 'all' if you want to run all of them (except go).
    
    Example: ${path.basename(process.argv[0])} ${path.basename(
      process.argv[1]
    )} python,ruby,erlang`
  );
  process.exit();
}

const selection = process.argv[2].split(',').map((x) => x.trim());

const scanners = {
  collector: () => {
    ['receiver', 'exporter', 'processor', 'extension'].forEach(
      async (component) => scanCollectorComponent(component)
    );
  },
  js: () => {
    scanByLanguage('instrumentation', 'js', 'plugins/node');
    scanByLanguage(
      'resource-detector',
      'js',
      'detectors/node',
      'resource-detector'
    );
  },
  java: () => {
    scanByLanguage(
      'instrumentation',
      'java',
      'instrumentation',
      'md',
      'opentelemetry-java-instrumentation'
    );
  },
  ruby: () => {
    scanByLanguage('instrumentation', 'ruby');
    scanByLanguage('exporter', 'ruby', 'exporter', 'md', 'opentelemetry-ruby');
  },
  erlang: () => {
    scanByLanguage('instrumentation', 'erlang', 'instrumentation');
  },
  python: () => {
    scanByLanguage('instrumentation', 'python', 'instrumentation', 'rst');
    scanByLanguage(
      'exporter',
      'python',
      'exporter',
      'rst',
      'opentelemetry-python'
    );
  },
  dotnet: () => {
    [
      ['instrumentation', 'opentelemetry-dotnet'],
      ['instrumentation', 'opentelemetry-dotnet-contrib'],
      ['exporter', 'opentelemetry-dotnet'],
      ['exporter', 'opentelemetry-dotnet-contrib'],
    ].forEach(async ([registryType, repo]) => {
      scanByLanguage(
        registryType,
        'dotnet',
        'src',
        'md',
        repo,
        (item) => item.name.toLowerCase().includes(registryType),
        (name) => name.split('.').splice(2, 3).join('').toLowerCase()
      );
    });
  },
  go: async () => {
    scanForGo();
  },
  php: async () => {
    scanByLanguage(
      'instrumentation',
      'php',
      'src/Instrumentation',
      'md',
      'opentelemetry-php-contrib',
      () => true,
      (name) => name.toLowerCase()
    );
  },
  all: () => {
    scanners.collector();
    scanners.js();
    scanners.java();
    scanners.ruby();
    scanners.erlang();
    scanners.python();
    scanners.dotnet();
    scanners.php();
  },
};

selection.forEach((selected) => {
  scanners[selected]();
});

async function scanForNew(
  path,
  repo,
  filter = () => true,
  keyMapper = (x) => x,
  owner = 'open-telemetry'
) {
  const result = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner,
      repo,
      path,
    }
  );
  return result.data.reduce((carry, current) => {
    if (filter(current) && current.type === 'dir') {
      const key = keyMapper(current.name);
      carry[key] = current;
    }
    return carry;
  }, {});
}

async function scanForExisting(type, noDash = false) {
  const result = await octokit.request(
    'GET /repos/open-telemetry/opentelemetry.io/contents/data/registry'
  );
  return result.data.reduce((carry, current) => {
    if (current.name.startsWith(type)) {
      const name = current.name
        .substring(type.length + 1, current.name.length - 4)
        .replaceAll('-', '');
      carry[name] = current;
    }
    return carry;
  }, {});
}

function createYaml(
  shortName,
  title,
  language,
  registryType,
  repo,
  description
) {
  return `title: ${title}
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
`;
}

function parseReadme(readme, format = 'md') {
  if (format === 'rst') {
    return readme.split('\n').reduce((result, line, index) => {
      if (!result.name && index === 0) {
        result.name = line;
      }
      if (!result.description && index > 1 && /^[A-Za-z]/.test(line)) {
        result.description = line;
      }
      return result;
    }, {});
  }
  // Markdown (md) is the default
  return readme.split('\n').reduce((result, line) => {
    if (!result.name && line.startsWith('#')) {
      result.name = line.substring(1).trim();
    }
    if (!result.description && /^[A-Za-z]/.test(line)) {
      result.description = line;
    }
    return result;
  }, {});
}

async function createFilesFromScanResult(existing, found, settings) {
  const { language, registryType, readmeFormat } = settings;
  const result = Object.keys(found).forEach(async (currentKey) => {
    // Check if the entry does not exist already and create it if needed.
    if (!Object.keys(existing).includes(currentKey)) {
      const current = found[currentKey];
      let parsedReadme = {
        name: currentKey,
        description: '',
      };
      try {
        const result = await octokit.request(
          `GET ${new URL(current.url).pathname}/README.${readmeFormat}`
        );
        parsedReadme = parseReadme(
          Buffer.from(result.data.content, 'base64').toString(),
          readmeFormat
        );
      } catch (e) {
        console.warn(
          `Request error while fetching README.md for ${currentKey}: ${e.message}`
        );
      }
      const yaml = createYaml(
        currentKey,
        parsedReadme.name,
        language,
        registryType,
        current.html_url,
        parsedReadme.description
      );
      // collector entries are named reverse (collector-{registryTpe}) compared to languages ({registryTpe}-{language}), we fix this here.
      const fileName = (
        language === 'collector'
          ? `${language}-${registryType}-${currentKey}.yml`
          : `${registryType}-${language}-${currentKey}.yml`
      ).toLowerCase();
      if (!ignoreList.includes(fileName)) {
        await fs.writeFile(fileName, yaml);
      }
    }
  });
}

async function scanByLanguage(
  registryType,
  language,
  path = registryType,
  readmeFormat = 'md',
  repo = `opentelemetry-${language}-contrib`,
  filter = () => true,
  keyMapper = (x) =>
    x
      .split(/[_-]/)
      .filter(
        (y) =>
          !['opentelemetry', registryType].includes(y) &&
          !y.match(/^[0-9]+.[0-9]+$/)
      )
      .join('')
) {
  // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/
  const found = await scanForNew(path, repo, filter, keyMapper);
  const existing = await scanForExisting(`${registryType}-${language}`);
  createFilesFromScanResult(existing, found, {
    language,
    registryType,
    readmeFormat,
  });
}

async function scanCollectorComponent(component) {
  const filter = (item) => item.name.endsWith(component);
  const keyMapper = (name) => name.substring(0, name.length - component.length);
  const found = Object.assign(
    await scanForNew(component, 'opentelemetry-collector', filter, keyMapper),
    await scanForNew(
      component,
      'opentelemetry-collector-contrib',
      filter,
      keyMapper
    )
  );
  const existing = await scanForExisting(`collector-${component}`, true);
  createFilesFromScanResult(existing, found, {
    language: 'collector',
    registryType: component,
    readmeFormat: 'md',
  });
}

async function scanForGo() {
  const response = await (
    await fetch(
      'https://pkg.go.dev/search?limit=100&m=package&q=go.opentelemetry.io%2Fcontrib%2Finstrumentation'
    )
  ).text();
  const $ = cheerioLoad(response);

  const items = [];

  $('.SearchSnippet').each((i, elem) => {
    const [title, url] = $(elem)
      .find('h2')
      .text()
      .trim('\n')
      .split('\n')
      .map((e) => e.trim());
    const description = $(elem).find('.SearchSnippet-synopsis').text().trim();

    items.push({
      title,
      description,
      url: 'https://' + url.substring(1, url.length - 1),
    });
  });

  const found = items.filter((item) => {
    return (
      typeof items.find((otherItem) => {
        return item.url != otherItem.url && item.url.includes(otherItem.url);
      }) === 'undefined'
    );
  });
  const existing = await scanForExisting(`instrumentation-go`);

  const language = 'go';
  const registryType = 'instrumentation';

  found.forEach(async (current) => {
    // Check if the entry does not exist already and create it if needed.
    if (!Object.keys(existing).includes(current.title)) {
      const yaml = createYaml(
        current.title,
        current.title,
        language,
        registryType,
        current.url,
        current.description
      );
      const fileName = `${registryType}-${language}-${current.title}.yml`;
      if (!ignoreList.includes(fileName)) {
        await fs.writeFile(fileName, yaml);
      }
    }
  });
}
