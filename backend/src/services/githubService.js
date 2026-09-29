import axios from 'axios';

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

export async function getUserRepositories(accessToken) {
  const allRepos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_URL}/user/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const repos = response.data;
    if (!repos || repos.length === 0) break;

    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  console.log(`Fetched ${allRepos.length} repositories`);
  return allRepos;
}

export async function getRepositoryTree(accessToken, owner, repo, branch) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  const files = [];
  if (response.data && response.data.tree) {
    for (const node of response.data.tree) {
      if (node.type === 'blob') {
        files.push({
          path: node.path,
          sha: node.sha,
          size: String(node.size || 0),
        });
      }
    }
  }

  console.log(`Found ${files.length} files in ${owner}/${repo}`);
  return files;
}

export async function getFileContent(accessToken, owner, repo, path) {
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (response.data && response.data.content) {
      const cleaned = response.data.content.replace(/\s/g, '');
      return Buffer.from(cleaned, 'base64').toString('utf-8');
    }
  } catch (error) {
    console.warn(`Failed to fetch ${path}: ${error.message}`);
  }
  return null;
}

export async function getRepositoryInfo(accessToken, owner, repo) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  return response.data;
}
