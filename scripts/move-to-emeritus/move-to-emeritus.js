import { readFile, writeFile, mkdir } from 'fs/promises';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const REPO = 'opentelemetry.io';
const ORG = 'open-telemetry';
const INACTIVITY_MONTHS = 4;

const ROLES = [
  { key: 'maintainers', section: 'Maintainers', emeritus: 'Emeritus maintainers' },
  { key: 'approvers', section: 'Approvers', emeritus: 'Emeritus approvers' },
  { key: 'triagers', section: 'Triagers', emeritus: 'Emeritus triagers' },
];

function getCutoffDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - INACTIVITY_MONTHS);
  return date.toISOString().split('T')[0];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'move-to-emeritus-script',
    Accept: 'application/vnd.github+json',
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.ok) {
      return res;
    }

    // Handle rate limiting (Search API returns 403, REST returns 429)
    if (res.status === 403 || res.status === 429) {
      const retryAfter = res.headers.get('retry-after');
      const resetTime = res.headers.get('x-ratelimit-reset');
      let waitMs;
      if (retryAfter) {
        waitMs = parseInt(retryAfter, 10) * 1000;
      } else if (resetTime) {
        waitMs = Math.max(0, parseInt(resetTime, 10) * 1000 - Date.now()) + 1000;
      } else {
        waitMs = 60_000;
      }
      console.warn(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s before retry...`);
      await sleep(waitMs);
      continue;
    }

    console.warn(`Attempt ${attempt} failed: HTTP ${res.status}`);
    if (attempt < retries) {
      await sleep(1000);
    } else {
      throw new Error(`All ${retries} attempts failed for ${url}`);
    }
  }
}

// Parse a role section from the README, returning member objects.
function parseSection(readme, sectionTitle) {
  const regex = new RegExp(
    `### ${sectionTitle}\\n[\\s\\S]*?(?=\\n###|$)`,
    'i',
  );
  const match = readme.match(regex);
  if (!match) return [];

  const memberRegex =
    /^- \[([^\]]+)\]\(https:\/\/github\.com\/([^)]+)\)(?:,\s*(.+))?$/gm;
  const members = [];
  let m;
  while ((m = memberRegex.exec(match[0])) !== null) {
    members.push({
      name: m[1],
      username: m[2],
      affiliation: m[3] || null,
      line: m[0],
    });
  }
  return members;
}

// Check if a user has been active in the repo since the cutoff date.
// Uses GitHub Search API: PR reviews and PR authorship.
// Short-circuits on first activity found.
async function isActive(username, cutoff) {
  const queries = [
    // PRs where the user has reviewed and the PR has been updated since the cutoff.
    `type:pr repo:${ORG}/${REPO} reviewed-by:${username} updated:>=${cutoff}`,
    // PRs authored by the user that were created since the cutoff.
    `type:pr repo:${ORG}/${REPO} author:${username} created:>=${cutoff}`,
  ];

  for (const q of queries) {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=1`;
    const res = await fetchWithRetry(url);
    const data = await res.json();
    if (typeof data.total_count !== 'number') {
      throw new Error(`Unexpected API response for ${username}: ${JSON.stringify(data)}`);
    }
    if (data.total_count > 0) {
      return true;
    }
  }
  return false;
}

// Remove a member line from a section in the README
function removeMemberFromSection(readme, sectionTitle, memberLine) {
  const escaped = memberLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(### ${sectionTitle}\\n[\\s\\S]*?)${escaped}\\n`,
    'i',
  );
  const result = readme.replace(regex, '$1');
  if (result === readme) {
    throw new Error(`Failed to remove "${memberLine}" from section "${sectionTitle}"`);
  }
  return result;
}

// Add a member to an emeritus section. Creates the section if it doesn't exist.
function addToEmeritusSection(readme, emeritusTitle, memberEntry) {
  const sectionRegex = new RegExp(
    `(### ${emeritusTitle}\\n)([\\s\\S]*?)(?=\\n###|\\nLearn more|$)`,
    'i',
  );
  const match = readme.match(sectionRegex);

  if (match) {
    const sectionContent = match[2];

    // Skip if already present
    if (sectionContent.includes(memberEntry)) {
      return readme;
    }

    const lines = sectionContent.split('\n');
    let lastMemberIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('- [')) {
        lastMemberIdx = i;
      }
    }
    if (lastMemberIdx >= 0) {
      lines.splice(lastMemberIdx + 1, 0, memberEntry);
    } else {
      lines.splice(1, 0, memberEntry);
    }
    const newContent = match[1] + lines.join('\n');
    // Use replacer function to avoid $-sequence interpretation
    return readme.replace(sectionRegex, () => newContent);
  }

  // Section doesn't exist — create it
  return createEmeritusSection(readme, emeritusTitle, memberEntry);
}

function createEmeritusSection(readme, title, memberEntry) {
  const emeritusInfo = `For more information about the emeritus role, see the
[community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#emeritus-maintainerapprovertriager).`;

  const newSection = `### ${title}\n\n${memberEntry}\n\n${emeritusInfo}\n`;

  // Insert before "Learn more about roles"
  const insertPoint = readme.indexOf('\nLearn more about roles');
  if (insertPoint >= 0) {
    return (
      readme.slice(0, insertPoint) +
      '\n' +
      newSection +
      '\n' +
      readme.slice(insertPoint + 1)
    );
  }

  // Fallback: insert before ## Licenses
  const licensesIdx = readme.indexOf('\n## Licenses');
  if (licensesIdx >= 0) {
    return (
      readme.slice(0, licensesIdx) +
      '\n' +
      newSection +
      '\n' +
      readme.slice(licensesIdx)
    );
  }

  return readme + '\n' + newSection;
}

function toEmeritusEntry(member) {
  return `- [${member.name}](https://github.com/${member.username})`;
}

async function main() {
  const cutoff = getCutoffDate();
  console.log(`Checking for inactivity since ${cutoff} ...`);

  let readme = await readFile('README.md', 'utf8');

  const inactiveByRole = {};
  let totalInactive = 0;

  for (const role of ROLES) {
    const members = parseSection(readme, role.section);
    console.log(
      `Found ${members.length} ${role.key}: ${members.map((m) => m.username).join(', ')}`,
    );

    const inactive = [];
    for (const member of members) {
      console.log(`  Checking ${member.username}...`);
      const active = await isActive(member.username, cutoff);
      if (!active) {
        console.log(`  -> ${member.username} is INACTIVE`);
        inactive.push(member);
      } else {
        console.log(`  -> ${member.username} is active`);
      }
    }

    if (inactive.length > 0) {
      inactiveByRole[role.key] = { role, inactive };
      totalInactive += inactive.length;
    }
  }

  if (totalInactive === 0) {
    console.log('No inactive members found. Nothing to do.');
    return;
  }

  // Update README
  for (const { role, inactive } of Object.values(inactiveByRole)) {
    for (const member of inactive) {
      readme = removeMemberFromSection(readme, role.section, member.line);
      readme = addToEmeritusSection(readme, role.emeritus, toEmeritusEntry(member));
    }
  }

  await writeFile('README.md', readme, 'utf8');
  console.log('README.md updated.');

  // Generate PR body
  await mkdir('.tmp', { recursive: true });

  let prBody = `## Move inactive members to emeritus\n\n`;
  prBody += `The following members have had no activity in \`${ORG}/${REPO}\` since **${cutoff}** and are being moved to emeritus:\n\n`;

  for (const { role, inactive } of Object.values(inactiveByRole)) {
    prBody += `### ${role.section}\n\n`;
    for (const member of inactive) {
      prBody += `- @${member.username}\n`;
    }
    prBody += '\n';
  }

  prBody += `Activity was checked for: PR reviews, PR authorship, and issue/PR comments.\n`;

  await writeFile('.tmp/emeritus-pr-body.md', prBody, 'utf8');
  console.log('PR body written to .tmp/emeritus-pr-body.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
