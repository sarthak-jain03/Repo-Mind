import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

const FileTreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isDir = node.type === 'tree';

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-zinc-900/50 rounded-md text-[13px] ${
          isDir ? 'text-zinc-300 font-medium' : 'text-zinc-400'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        <div className="w-4 flex items-center justify-center shrink-0">
          {isDir ? (
            isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />
          ) : (
            <File size={12} className="text-zinc-600" />
          )}
        </div>
        <span className="truncate">{node.name}</span>
      </div>

      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileTreeNode key={`${child.path}-${i}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ files, repoName }) {
  const buildTree = (flatFiles) => {
    const root = { name: repoName, type: 'tree', path: '', children: [] };
    
    flatFiles.forEach(file => {
      const parts = file.path.split('/');
      let currentLevel = root.children;
      
      parts.forEach((part, i) => {
        const isLast = i === parts.length - 1;
        const existingNode = currentLevel.find(n => n.name === part);
        
        if (existingNode) {
          if (!existingNode.children) existingNode.children = [];
          currentLevel = existingNode.children;
        } else {
          const newNode = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: isLast ? (file.type || 'blob') : 'tree',
            children: isLast ? undefined : []
          };
          currentLevel.push(newNode);
          if (!isLast) currentLevel = newNode.children;
        }
      });
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children) sortTree(node.children);
      });
    };
    
    sortTree(root.children);
    return root;
  };

  const tree = files.length > 0 ? buildTree(files) : { name: repoName, type: 'tree', children: [] };

  return (
    <div className="py-4">
      <div className="px-4 mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        Explorer
      </div>
      <FileTreeNode node={tree} />
    </div>
  );
}
