import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export default function ChatBubble({ message, role, sources, timestamp }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'USER';

  const uniqueSources = sources ? sources.filter((source, index, self) => 
    index === self.findIndex((s) => (
      (s.filePath || s.path) === (source.filePath || source.path)
    ))
  ) : [];

  const formatTime = (isoString) => {
    if (!isoString) return 'Today 11:05 AM'; // fallback
    const date = new Date(isoString);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
                    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();
                        
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today ${timeStr}`;
    if (isYesterday) return `Yesterday ${timeStr}`;
    return `${date.toLocaleDateString()} ${timeStr}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col w-full mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      {isUser && (
        <div className="text-xs text-zinc-400 mb-2">
          {formatTime(timestamp)}
        </div>
      )}
      
      <div className={`flex gap-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-full md:max-w-[85%] overflow-x-auto break-words min-w-0`}>
          <div className={`
            px-5 py-3.5 text-sm leading-relaxed
            ${isUser 
              ? 'bg-[#1a3b5c] text-zinc-100 rounded-[24px]' 
              : 'bg-transparent text-zinc-300 rounded-none'
            }
          `}>
            <div className={`prose prose-invert max-w-none prose-sm 
              ${isUser ? 'prose-p:text-zinc-100' : 'prose-p:text-zinc-300'} 
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto
              ${!isUser && 'prose-blockquote:border-l-4 prose-blockquote:border-zinc-600 prose-blockquote:pl-4 prose-blockquote:text-zinc-400 prose-blockquote:not-italic'}
            `}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-[13px]" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
                {message}
              </ReactMarkdown>
            </div>

            {uniqueSources.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {uniqueSources.map((source, idx) => (
                  <div 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400"
                    title={source.filePath || source.path || ''}
                  >
                    <span>📄</span>
                    <span className="truncate max-w-[200px]">
                      {(source.filePath || source.path || '').split('/').pop()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {!isUser && (
            <div className="flex items-center gap-3 mt-3 text-zinc-400 ml-2">
              <button 
                onClick={handleCopy}
                className="hover:text-zinc-200 transition-colors"
                title="Copy response"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
