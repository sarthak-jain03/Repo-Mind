import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Database, Search, Mail } from 'lucide-react';
import { authService } from '../services/authService';

const GitHubIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedInIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const features = [
  {
    icon: Database,
    title: 'Contextual Search',
    description: 'Understands your entire repository architecture to give you accurate answers grounded in your codebase.',
  },
  {
    icon: Search,
    title: 'Code Analysis',
    description: 'Find dependencies, identify potential bugs, and trace execution paths without leaving your browser.',
  },
  {
    icon: Code2,
    title: 'Language Agnostic',
    description: 'Works out of the box with standard languages including Java, TypeScript, Python, Go, and Rust.',
  }
];

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-zinc-800 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto w-full text-center space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-tight">
              Understand your codebase <br className="hidden md:block" />
              with intelligent search.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Connect your GitHub account and instantly search, analyze, and query your repositories using natural language.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-white text-zinc-950 px-6 py-3 rounded-md font-medium flex items-center gap-3 hover:bg-zinc-200 transition-colors"
              >
                Go to Dashboard
                <ArrowRight size={18} className="ml-1" />
              </Link>
            ) : (
              <button
                onClick={() => authService.loginWithGitHub()}
                className="bg-white text-zinc-950 px-6 py-3 rounded-md font-medium flex items-center gap-3 hover:bg-zinc-200 transition-colors"
              >
                <GitHubIcon size={20} />
                Continue with GitHub
                <ArrowRight size={18} className="ml-1" />
              </button>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20">
                <div className="h-10 w-10 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-zinc-100" />
                </div>
                <h3 className="text-base font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-zinc-500 border-t border-zinc-900">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-4">
          <a href="https://github.com/sarthak-jain03" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
            <GitHubIcon size={16} />
            <span>GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/sarthak-jain-3a2b38276/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
            <LinkedInIcon size={16} />
            <span>LinkedIn</span>
          </a>
          <a href="mailto:sarthakjain4452@gmail.com" className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
            <Mail size={16} />
            <span>Email</span>
          </a>
        </div>
        <p>RepoMind © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
