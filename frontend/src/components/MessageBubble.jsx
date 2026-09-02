import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-4 ${isUser
          ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
          : 'bg-gray-800 text-gray-200 shadow-md border border-gray-700'
          }`}
      >
        <div className="text-sm prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="rounded-lg overflow-hidden my-3 border border-gray-700 shadow-sm">
                    <div className="bg-gray-900 px-4 py-1 text-xs text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold">
                      {match[1]}
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, background: '#1e1e1e', padding: '1rem' }}
                    />
                  </div>
                ) : (
                  <code {...props} className={`${className} bg-gray-900 px-1.5 py-0.5 rounded text-pink-300 font-mono text-sm`}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Render Artifacts (e.g. Images from Vision Agent) */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {message.artifacts.map((artifact, i) => {
              if (artifact.type === 'image') {
                return (
                  <img
                    key={i}
                    src={artifact.url}
                    alt="Generated output"
                    className="rounded-lg max-w-full h-auto object-cover shadow-sm border border-gray-700"
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
