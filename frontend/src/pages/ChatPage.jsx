import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import FileTree from '../components/FileTree';
import LoadingSpinner from '../components/LoadingSpinner';
import { chatService } from '../services/chatService';
import { repoService } from '../services/repoService';

export default function ChatPage() {
  const { repoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const repo = location.state?.repo;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [fileTree, setFileTree] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    loadFileTree();
  }, [repoId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(repoId);
      setMessages(history.map(msg => ({
        ...msg,
        role: msg.role,
        message: msg.message,
        sources: msg.sources || [],
        timestamp: msg.timestamp,
      })));
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFileTree = async () => {
    try {
      const tree = await repoService.getRepositoryTree(repoId);
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to load file tree:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = {
      role: 'USER',
      message: trimmed,
      sources: [],
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await chatService.sendMessage(repoId, trimmed);
      setMessages(prev => [...prev, {
        role: response.role || 'ASSISTANT',
        message: response.message,
        sources: response.sources || [],
        timestamp: response.timestamp,
      }]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        sources: [],
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What's the overall architecture of this project?",
    "Where is the main entry point?",
    "How is authentication handled?"
  ];

  return (
    <div className="h-dvh flex flex-col bg-black pt-16 overflow-hidden">
      <div className="border-b border-zinc-900 bg-black px-4 py-2 flex items-center shrink-0 min-w-0">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <div className="h-4 w-px bg-zinc-800 mx-1 shrink-0" />
          <span className="text-sm font-medium text-zinc-200 truncate">
            {repo?.fullName || `Repository #${repoId}`}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <>
            <div 
              className="absolute inset-0 bg-black/50 z-10 md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute md:relative z-20 w-80 md:w-64 h-full border-r border-zinc-900 bg-black flex-shrink-0 overflow-y-auto scrollbar-none shadow-2xl md:shadow-none">
              <FileTree files={fileTree} repoName={repo?.name || 'Repository'} />
            </aside>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-black">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 scrollbar-none">
            {loading ? (
              <LoadingSpinner message="Loading chat..." />
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center px-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-xl">👋</span>
                </div>
                <h2 className="text-lg font-medium text-zinc-100 mb-2">
                  Chat with {repo?.name}
                </h2>
                <p className="text-sm text-zinc-400 mb-8">
                  Ask questions about the architecture, search for specific implementations, or get help debugging.
                </p>
                <div className="w-full space-y-2 text-left">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md text-sm text-zinc-300 transition-colors flex items-center gap-3"
                    >
                      <span className="text-zinc-500">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    message={msg.message}
                    role={msg.role}
                    sources={msg.sources}
                    timestamp={msg.timestamp}
                  />
                ))}
                {sending && (
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs text-zinc-400">AI</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm py-1.5">
                      <Loader2 size={14} className="animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 bg-black pb-4 md:pb-8 shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3 bg-[#2f2f2f] rounded-[24px] md:rounded-[32px] p-2 pl-3 md:pl-4 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none max-h-[200px] py-3 self-center"
                style={{ height: 'auto', overflow: input.split('\n').length > 1 ? 'auto' : 'hidden' }}
                disabled={sending}
              />

              <div className="flex items-center gap-2 mb-1 shrink-0">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="flex items-center justify-center p-2.5 bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-full transition-colors ml-1"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-4 font-medium tracking-wide">
              RepoMind can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
