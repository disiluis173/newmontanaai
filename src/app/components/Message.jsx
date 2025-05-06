'use client'

import React, { useState } from 'react';
import { FaUser, FaRobot, FaCode, FaCopy, FaBrain, FaChevronDown, FaChevronUp, FaFileCode, FaMarkdown } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Message = ({ message, isUser, provider, isStreaming, onCodeBlockClick }) => {
  const providerClass = provider === 'deepseek' ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-blue-800';
  const hasReasoning = message.reasoning && message.reasoning.trim() !== '';
  const [showReasoning, setShowReasoning] = useState(false);

  // Componente personalizado para renderizar código con sintaxis resaltada
  const CodeBlock = ({ language, value }) => {
    return (
      <div className="relative group my-4 border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFileCode />
            <span>{language || 'código'}</span>
          </div>
          <button
            onClick={() => onCodeBlockClick(value)}
            className="p-1 rounded hover:bg-gray-700 flex items-center gap-1 text-xs"
            title="Copiar código"
          >
            <FaCopy size={12} /> <span>Copiar</span>
          </button>
        </div>
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={vscDarkPlus}
          className="rounded-b-lg"
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            backgroundColor: '#1e1e1e',
            borderRadius: '0'
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Componente para párrafos con estilos mejorados
  const Paragraph = ({ children }) => {
    return (
      <p className="mb-4 leading-relaxed">{children}</p>
    );
  };

  // Componente para enlaces
  const Link = ({ href, children }) => {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    );
  };
  
  // Componente para listas
  const ListItem = ({ children }) => {
    return (
      <li className="mb-1 ml-4">{children}</li>
    );
  };

  // Componente para encabezados
  const Heading = ({ level, children }) => {
    const sizeClasses = {
      1: 'text-2xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700',
      2: 'text-xl font-bold mt-5 mb-3',
      3: 'text-lg font-bold mt-4 mb-2',
      4: 'text-base font-bold mt-3 mb-2',
      5: 'text-sm font-bold mt-3 mb-1',
      6: 'text-xs font-bold mt-3 mb-1'
    };
    
    const Component = `h${level}`;
    return <Component className={sizeClasses[level]}>{children}</Component>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
          {isUser ? <FaUser /> : <FaRobot />}
        </div>
        <div className={`mx-2 ${isUser ? 'text-right' : 'text-left'} w-full`}>
          {hasReasoning && (
            <div className="mb-2 w-full">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition w-fit"
              >
                <FaBrain className="text-blue-500" />
                Razonamiento
                <span className={`transition-transform ${showReasoning ? 'rotate-180' : ''}`}>
                  <FaChevronDown />
                </span>
              </button>
              <AnimatePresence>
                {showReasoning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow"
                  >
                    <div className="whitespace-pre-wrap">{message.reasoning}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div className={`p-4 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'} shadow-sm markdown-content`}>
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    return !inline ? (
                      <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code className="bg-gray-900 text-gray-200 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: Paragraph,
                  a: Link,
                  li: ListItem,
                  h1: ({ children }) => <Heading level={1}>{children}</Heading>,
                  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
                  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
                  h4: ({ children }) => <Heading level={4}>{children}</Heading>,
                  h5: ({ children }) => <Heading level={5}>{children}</Heading>,
                  h6: ({ children }) => <Heading level={6}>{children}</Heading>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                  hr: () => <hr className="my-4 border-gray-300 dark:border-gray-700" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-300 dark:border-gray-700">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-700">{children}</tr>,
                  th: ({ children }) => <th className="px-4 py-2 text-left">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Pensando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 