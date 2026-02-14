import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

// Lightweight markdown-to-HTML renderer (no external deps)
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (triple backtick)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre class="md-code-block"><code class="lang-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // Unordered lists (handle multiple consecutive lines starting with - or *)
  html = html.replace(/^(?:[-*] .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^[-*] /, '')}</li>`
    ).join('');
    return `<ul class="md-ul">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^(?:\d+\. .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\d+\. /, '')}</li>`
    ).join('');
    return `<ol class="md-ol">${items}</ol>`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p class="md-p">');

  // Single line breaks within paragraphs
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph if not already wrapped in block element
  if (!html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
    html = `<p class="md-p">${html}</p>`;
  }

  return html;
}

// Markdown CSS styles injected into the component
const markdownStyles = `
.cea-message .md-h1 { font-size: 1.25rem; font-weight: 600; color: #e4e4e7; margin: 0.75rem 0 0.5rem; }
.cea-message .md-h2 { font-size: 1.1rem; font-weight: 600; color: #e4e4e7; margin: 0.6rem 0 0.4rem; }
.cea-message .md-h3 { font-size: 1rem; font-weight: 600; color: #d4d4d8; margin: 0.5rem 0 0.3rem; }
.cea-message .md-h4 { font-size: 0.9rem; font-weight: 600; color: #d4d4d8; margin: 0.4rem 0 0.25rem; }
.cea-message strong { color: #e4e4e7; font-weight: 600; }
.cea-message em { color: #a1a1aa; font-style: italic; }
.cea-message .md-p { margin: 0.35rem 0; }
.cea-message .md-p:first-child { margin-top: 0; }
.cea-message .md-p:last-child { margin-bottom: 0; }
.cea-message .md-ul, .cea-message .md-ol { margin: 0.4rem 0; padding-left: 1.25rem; }
.cea-message .md-ul li, .cea-message .md-ol li { margin: 0.2rem 0; color: #a1a1aa; }
.cea-message .md-ul { list-style-type: disc; }
.cea-message .md-ol { list-style-type: decimal; }
.cea-message .md-code-block {
  background: #18181b; border: 1px solid #27272a; padding: 0.75rem; margin: 0.5rem 0;
  overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
}
.cea-message .md-code-block code { color: #a1a1aa; font-family: 'JetBrains Mono', 'Fira Code', monospace; }
.cea-message .md-inline-code {
  background: #27272a; color: #f59e0b; padding: 0.1rem 0.35rem; font-size: 0.85em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.cea-message .md-link { color: #f59e0b; text-decoration: underline; text-underline-offset: 2px; }
.cea-message .md-link:hover { color: #fbbf24; }
.cea-message .md-hr { border: none; border-top: 1px solid #27272a; margin: 0.75rem 0; }
`;

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate CEA typing indicator briefly after user message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.from === 'tiger') {
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(t);
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    "What should I focus on today?",
    "Show me this week's progress",
    "Spawn a new agent",
    "What's blocking revenue?",
  ];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      {/* Inject markdown styles */}
      <style>{markdownStyles}</style>

      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500/15 flex items-center justify-center text-lg" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
          🧠
        </div>
        <div>
          <div className="text-sm font-medium text-zinc-200">The CEA</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online · Managing HeartBased.io
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-500 border border-zinc-700">
            Powered by Claude Sonnet 4.5
          </span>
          <span className="text-[10px] text-zinc-600">
            Direct line to your Chief Executive Agent
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3 max-w-3xl',
              msg.from === 'tiger' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            {msg.from !== 'tiger' && (
              <div className="w-8 h-8 bg-amber-500/15 flex items-center justify-center text-sm shrink-0 mt-1" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                🧠
              </div>
            )}
            <div className={cn(
              'max-w-[75%]',
              msg.from === 'tiger' ? 'text-right' : ''
            )}>
              <div className="flex items-center gap-2 mb-1">
                {msg.from === 'tiger' ? (
                  <>
                    <span className="text-[10px] text-zinc-600">{msg.timestamp}</span>
                    <span className="text-xs font-medium text-zinc-400">You</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-amber-400/80">The CEA</span>
                    <span className={cn(
                      'text-[9px] px-1 py-0.5',
                      msg.type === 'directive' && 'bg-amber-500/15 text-amber-400',
                      msg.type === 'report' && 'bg-emerald-500/15 text-emerald-400',
                      msg.type === 'alert' && 'bg-red-500/15 text-red-400',
                      msg.type === 'message' && 'bg-zinc-800 text-zinc-500',
                    )}>
                      {msg.type}
                    </span>
                    <span className="text-[10px] text-zinc-600">{msg.timestamp}</span>
                  </>
                )}
              </div>
              {msg.from === 'tiger' ? (
                <div className="text-sm leading-relaxed px-4 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {msg.content}
                </div>
              ) : (
                <div
                  className="cea-message text-sm leading-relaxed px-4 py-3 bg-zinc-900 text-zinc-300 border border-zinc-800"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              )}
            </div>
            {msg.from === 'tiger' && (
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm shrink-0 mt-1">
                🐯
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500/15 flex items-center justify-center text-sm shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              🧠
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-500">
              <span className="animate-pulse">The CEA is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length <= 6 && (
        <div className="px-6 pb-2">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => onSendMessage(action)}
                className="text-[11px] px-3 py-1.5 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-zinc-800">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the CEA..."
              rows={1}
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-700"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'px-4 py-3 text-sm transition-all border',
              input.trim()
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-zinc-900 text-zinc-700 border-zinc-800 cursor-not-allowed'
            )}
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-zinc-700 mt-2">
          Press Enter to send · The CEA processes directives, reports, and strategic queries
        </div>
      </div>
    </div>
  );
}
