import { readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const REPO = 'opentelemetry.io';
const ORG = 'open-telemetry';
const INACTIVITY_MONTHS = 4;

const ROLES = [
  {
    key: 'maintainers',
    section: 'Maintainers',
    emeritus: 'Emeritus maintainers',
  },
  { key: 'approvers', section: 'Approvers', emeritus: 'Emeritus approvers' },
  { key: 'triagers', section: 'Triagers', emeritus: 'Emeritus triagers' },
];

function getCutoffDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - INACTIVITY_MONTHS);
  return date.toISOString().split('T')[0];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'move-to-emeritus-script',
    Accept: 'application/vnd.github+json',
    ...options.headers,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, { ...options, headers });

    if (res.ok) {
      return res;
    }

    if (res.status === 403 || res.status === 429) {
      const retryAfter = res.headers.get('retry-after');
      const resetTime = res.headers.get('x-ratelimit-reset');
      let waitMs;
      if (retryAfter) {
        waitMs = parseInt(retryAfter, 10) * 1000;
      } else if (resetTime) {
        waitMs =
          Math.max(0, parseInt(resetTime, 10) * 1000 - Date.now()) + 1000;
      } else {
        waitMs = 60_000;
      }
      console.warn(
        `Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s before retry...`,
      );
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

// Fetch all lang:* labels from the repo to exclude localization-only activity.
async function fetchLangLabels() {
  const query = `query {
    repository(owner: "${ORG}", name: "${REPO}") {
      labels(first: 100, query: "lang:") { nodes { name } }
    }
  }`;
  const res = await fetchWithRetry('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data.repository.labels.nodes
    .map((l) => l.name)
    .filter((n) => n.startsWith('lang:'));
}

// Batch-check activity for all users via a single GraphQL request using aliases.
// Returns a Set of usernames that have been active since the cutoff date.
// Excludes issues/PRs labeled with lang:* labels (localization-only activity).
async function fetchActiveUsers(usernames, cutoff, langLabels) {
  const exclude = langLabels.map((l) => `-label:\\"${l}\\"`).join(' ');

  const aliases = usernames.flatMap((user) => {
    const safeUser = user.replace(/[^a-zA-Z0-9]/g, '_');
    const reviewQuery = `type:pr repo:${ORG}/${REPO} reviewed-by:${user} updated:>=${cutoff} ${exclude}`;
    const authorQuery = `type:pr repo:${ORG}/${REPO} author:${user} created:>=${cutoff} ${exclude}`;
    const commentQuery = `repo:${ORG}/${REPO} commenter:${user} updated:>=${cutoff} ${exclude}`;
    return [
      `${safeUser}_reviews: search(query: "${reviewQuery}", type: ISSUE, first: 1) { issueCount }`,
      `${safeUser}_authored: search(query: "${authorQuery}", type: ISSUE, first: 1) { issueCount }`,
      `${safeUser}_comments: search(query: "${commentQuery}", type: ISSUE, first: 1) { issueCount }`,
    ];
  });

  const query = `query { ${aliases.join('\n')} }`;

  const res = await fetchWithRetry('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const activeUsers = new Set();
  for (const user of usernames) {
    const safeUser = user.replace(/[^a-zA-Z0-9]/g, '_');
    const reviews = json.data[`${safeUser}_reviews`]?.issueCount ?? 0;
    const authored = json.data[`${safeUser}_authored`]?.issueCount ?? 0;
    const comments = json.data[`${safeUser}_comments`]?.issueCount ?? 0;
    if (reviews > 0 || authored > 0 || comments > 0) {
      activeUsers.add(user);
    }
  }
  return activeUsers;
}

// Parse a role section from the README, returning member objects.
function parseSection(readme, sectionTitle) {
  const regex = new RegExp(`### ${sectionTitle}\\n[\\s\\S]*?(?=\\n###|$)`, 'i');
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

// Remove a member line from a section in the README
function removeMemberFromSection(readme, sectionTitle, memberLine) {
  const escaped = memberLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(### ${sectionTitle}\\n[\\s\\S]*?)${escaped}\\n`,
    'i',
  );
  const result = readme.replace(regex, '$1');
  if (result === readme) {
    throw new Error(
      `Failed to remove "${memberLine}" from section "${sectionTitle}"`,
    );
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

  // Collect all members across roles
  const allMembers = [];
  const membersByRole = [];
  for (const role of ROLES) {
    const members = parseSection(readme, role.section);
    console.log(
      `Found ${members.length} ${role.key}: ${members.map((m) => m.username).join(', ')}`,
    );
    membersByRole.push({ role, members });
    allMembers.push(...members);
  }

  // Fetch lang:* labels to exclude localization-only activity
  const langLabels = await fetchLangLabels();
  console.log(`Excluding lang labels: ${langLabels.join(', ') || '(none)'}`);

  // Batch-check activity for all users in a single GraphQL request
  const allUsernames = allMembers.map((m) => m.username);
  const activeUsers = await fetchActiveUsers(allUsernames, cutoff, langLabels);
  console.log(`Active users: ${[...activeUsers].join(', ') || '(none)'}`);

  const inactiveByRole = {};
  let totalInactive = 0;

  for (const { role, members } of membersByRole) {
    const inactive = members.filter((m) => !activeUsers.has(m.username));
    for (const m of inactive) {
      console.log(`  ${m.username} is INACTIVE (${role.key})`);
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
      readme = addToEmeritusSection(
        readme,
        role.emeritus,
        toEmeritusEntry(member),
      );
    }
  }

  await writeFile('README.md', readme, 'utf8');
  console.log('README.md updated.');

  // Generate PR body in a temp directory (RUNNER_TEMP in CI, os.tmpdir() locally)
  const tmpDir = process.env.RUNNER_TEMP || tmpdir();
  const prBodyPath = join(tmpDir, 'emeritus-pr-body.md');

  let prBody = `## Move inactive members to emeritus\n\n`;
  prBody += `The following members have had no activity in \`${ORG}/${REPO}\` since **${cutoff}** and are being moved to emeritus:\n\n`;

  for (const { role, inactive } of Object.values(inactiveByRole)) {
    prBody += `### ${role.section}\n\n`;
    for (const member of inactive) {
      prBody += `- @${member.username}\n`;
    }
    prBody += '\n';
  }

  prBody += `Activity was checked for: PR reviews, PR authorship, and issue/PR comments (excluding localization-only activity).\n`;

  await writeFile(prBodyPath, prBody, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
