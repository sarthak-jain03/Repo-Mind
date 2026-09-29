const MAX_CHUNK_SIZE = 1500;

const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.bmp', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.avi', '.mov', '.wav',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.exe', '.dll', '.so', '.dylib', '.class', '.jar',
  '.min.js', '.min.css',
  '.lock', '.map',
]);

const SKIP_DIRECTORIES = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'target',
  '__pycache__', '.pytest_cache', '.next', '.nuxt', 'vendor',
  '.idea', '.vscode', '.settings', 'coverage', '.nyc_output',
]);

const CODE_EXTENSIONS = new Set([
  '.java', '.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rs',
  '.cpp', '.c', '.h', '.hpp', '.cs', '.rb', '.php', '.swift',
  '.kt', '.scala', '.r', '.m', '.mm', '.lua', '.pl', '.pm',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yml', '.yaml', '.xml', '.toml', '.ini', '.cfg',
  '.md', '.txt', '.rst',
  '.sql', '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
  '.dockerfile', '.tf', '.hcl', '.proto', '.graphql', '.gql',
]);

export function shouldIndex(filePath) {
  const lowerPath = filePath.toLowerCase();

  for (const skipDir of SKIP_DIRECTORIES) {
    if (lowerPath.includes(`/${skipDir}/`) || lowerPath.startsWith(`${skipDir}/`)) {
      return false;
    }
  }

  for (const ext of SKIP_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) return false;
  }

  for (const ext of CODE_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) return true;
  }

  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1).toLowerCase();
  return fileName === 'dockerfile' || fileName === 'makefile' ||
    fileName === '.gitignore' || fileName === '.env.example';
}

export function chunkFile(filePath, content) {
  if (!content || content.trim() === '') return [];
  if (content.length > 500_000) return [];

  const language = detectLanguage(filePath);
  const chunks = [];

  if (content.length <= MAX_CHUNK_SIZE) {
    chunks.push({
      content, filePath, language,
      startLine: 1,
      endLine: content.split('\n').length,
      chunkIndex: 0,
    });
    return chunks;
  }

  const lines = content.split('\n');
  let currentChunk = '';
  let chunkStartLine = 1;
  let currentLine = 1;
  let chunkIndex = 0;

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk, filePath, language,
        startLine: chunkStartLine,
        endLine: currentLine - 1,
        chunkIndex: chunkIndex++,
      });

      const chunkLines = currentChunk.split('\n');
      const overlapLines = Math.min(chunkLines.length, 5);
      const overlapStart = chunkLines.length - overlapLines;
      chunkStartLine = currentLine - overlapLines;

      currentChunk = '';
      for (let i = overlapStart; i < chunkLines.length; i++) {
        currentChunk += chunkLines[i] + '\n';
      }
    }

    currentChunk += line + '\n';
    currentLine++;
  }

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk, filePath, language,
      startLine: chunkStartLine,
      endLine: currentLine - 1,
      chunkIndex,
    });
  }

  return chunks;
}

export function detectLanguage(filePath) {
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.endsWith('.java')) return 'java';
  if (lowerPath.endsWith('.py')) return 'python';
  if (lowerPath.endsWith('.js')) return 'javascript';
  if (lowerPath.endsWith('.ts')) return 'typescript';
  if (lowerPath.endsWith('.jsx')) return 'jsx';
  if (lowerPath.endsWith('.tsx')) return 'tsx';
  if (lowerPath.endsWith('.go')) return 'go';
  if (lowerPath.endsWith('.rs')) return 'rust';
  if (lowerPath.endsWith('.cpp') || lowerPath.endsWith('.c')) return 'c/c++';
  if (lowerPath.endsWith('.cs')) return 'csharp';
  if (lowerPath.endsWith('.rb')) return 'ruby';
  if (lowerPath.endsWith('.php')) return 'php';
  if (lowerPath.endsWith('.swift')) return 'swift';
  if (lowerPath.endsWith('.kt')) return 'kotlin';
  if (lowerPath.endsWith('.html')) return 'html';
  if (lowerPath.endsWith('.css') || lowerPath.endsWith('.scss')) return 'css';
  if (lowerPath.endsWith('.sql')) return 'sql';
  if (lowerPath.endsWith('.sh') || lowerPath.endsWith('.bash')) return 'shell';
  if (lowerPath.endsWith('.yml') || lowerPath.endsWith('.yaml')) return 'yaml';
  if (lowerPath.endsWith('.json')) return 'json';
  if (lowerPath.endsWith('.xml')) return 'xml';
  if (lowerPath.endsWith('.md')) return 'markdown';
  return 'text';
}
