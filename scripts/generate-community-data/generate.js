import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import yaml from 'js-yaml';

config(); // Load .env file contents into process.env

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const org = 'open-telemetry';

const configParams = {
  terms: ['maintainers', 'approvers', 'triagers'],
  // Note that below is some custom code that will remove technical-committee members from spec-sponsors
  committees: ['governance-committee', 'technical-committee', 'spec-sponsors'],
  includePrivateMembersInGeneral: false,
  includePrivateMembersInGroups: true,
  createMembersList: true,
};

const outputPath = process.argv[2] || 'output.yml';

async function getTeams() {
  const teams = await octokit.paginate(octokit.rest.teams.list, {
    org,
    per_page: 100,
  });
  return teams;
}

async function getTeamMembers(team_slug) {
  const members = await octokit.paginate(octokit.rest.teams.listMembersInOrg, {
    org,
    team_slug,
    per_page: 100,
  });
  return members;
}

async function getOrgMembers() {
  const members = await octokit.paginate(octokit.rest.orgs.listMembers, {
    org,
    per_page: 100,
  });
  return members;
}

async function getPublicOrgMembers() {
  const publicMembers = await octokit.paginate(
    octokit.rest.orgs.listPublicMembers,
    {
      org,
      per_page: 100,
    },
  );
  return publicMembers;
}

async function collectDetails() {
  const teams = await getTeams();
  const allMembers = await getOrgMembers();
  const publicMembers = await getPublicOrgMembers();
  const teamMembers = new Set();
  const memberDetails = {};

  const result = {
    maintainers: [],
    approvers: [],
    triagers: [],
  };

  const committees = {};

  if (configParams.createMembersList) {
    result.members = [];
  }

  for (const team of teams) {
    const members = await getTeamMembers(team.slug);
    const filteredMembers = configParams.includePrivateMembersInGroups
      ? members
      : members.filter((member) =>
          publicMembers.some((pubMember) => pubMember.login === member.login),
        );

    const teamName = team.name.toLowerCase();

    // Check for committees
    for (const committee of configParams.committees) {
      if (teamName === committee) {
        if (!committees[committee]) {
          committees[committee] = [];
        }
        committees[committee].push(
          ...filteredMembers.map((member) => ({
            name: member.login,
            html_url: member.html_url,
            avatar_url: member.avatar_url,
          })),
        );
      }
    }

    // Collect members based on terms
    for (const term of configParams.terms) {
      if (teamName.includes(term)) {
        filteredMembers.forEach((member) => {
          teamMembers.add(member.login);
          if (!memberDetails[member.login]) {
            memberDetails[member.login] = {
              name: member.login,
              teams: [],
              html_url: member.html_url,
              avatar_url: member.avatar_url,
            };
          }
          memberDetails[member.login].teams.push(teamName);
        });
      }
    }
  }

  // Deduplicate and prioritize members
  const categorizedMembers = new Set();

  for (const term of configParams.terms) {
    Object.values(memberDetails).forEach((member) => {
      if (
        member.teams.some((team) => team.includes(term)) &&
        !categorizedMembers.has(member.name)
      ) {
        result[term].push(member);
        categorizedMembers.add(member.name);
      }
    });
  }

  // Find members who are not in any team
  if (configParams.createMembersList) {
    result.members = allMembers
      .filter((member) => !teamMembers.has(member.login))
      .filter(
        (member) =>
          configParams.includePrivateMembersInGeneral ||
          publicMembers.some((pubMember) => pubMember.login === member.login),
      )
      .map((member) => ({
        name: member.login,
        html_url: member.html_url,
        avatar_url: member.avatar_url,
      }));
  }

  // Remove technical-committee members from spec-sponsors
  if (committees['spec-sponsors'] && committees['technical-committee']) {
    committees['spec-sponsors'] = committees['spec-sponsors'].filter(
      (member) =>
        !committees['technical-committee'].some(
          (tcMember) => tcMember.name === member.name,
        ),
    );
  }

  // Sort committees to the top of the output
  const sortedResult = { ...committees, ...result };

  for (const key in sortedResult) {
    sortedResult[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Convert result to a plain JSON object to avoid YAML anchors
  const plainResult = JSON.parse(JSON.stringify(sortedResult));

  // Convert result to YAML and write to file
  const yamlResult = yaml.dump(plainResult, { lineWidth: -1 });
  fs.writeFileSync(outputPath, yamlResult, 'utf8');

  console.log(`Output written to ${outputPath}`);
}

collectDetails().catch(console.error);
