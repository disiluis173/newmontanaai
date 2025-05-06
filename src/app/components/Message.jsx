'use client'

import React, { useState } from 'react';
import { FaUser, FaRobot, FaCopy } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Message = ({ message, isUser, provider, isStreaming, onCodeBlockClick }) => {
  const [copied, setCopied] = useState(false);
  const providerClass = provider === 'deepseek' ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-blue-800';
  const providerColor = provider === 'deepseek' ? 'bg-purple-500' : 'bg-blue-500';

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content) => {
    const codeBlocks = content.match(/```([\s\S]*?)```/g);
    let processedContent = content;

    if (codeBlocks) {
      codeBlocks.forEach(block => {
        const language = block.match(/```(\w+)/)?.[1] || 'plaintext';
        const code = block.replace(/```\w*\n?/, '').replace(/```$/, '');
        
        processedContent = processedContent.replace(
          block,
          `<div class="code-block" data-language="${language}">${code}</div>`
        );
      });
    }

    const html = marked(processedContent);
    const sanitizedHtml = DOMPurify.sanitize(html);

    return (
      <div className="prose dark:prose-invert max-w-none">
        {codeBlocks?.map((block, index) => {
          const language = block.match(/```(\w+)/)?.[1] || 'plaintext';
          const code = block.replace(/```\w*\n?/, '').replace(/```$/, '');
          
          return (
            <div key={index} className="relative my-4">
              <div className="absolute right-2 top-2">
                <button
                  onClick={() => copyCode(code)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                  title="Copiar código"
                >
                  <FaCopy />
                </button>
                {copied && (
                  <span className="absolute -top-8 right-0 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                    ¡Copiado!
                  </span>
                )}
              </div>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                className="rounded-lg"
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        })}
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    );
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} p-4`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-200 dark:bg-gray-700' : providerColor}`}>
        {isUser ? (
          <FaUser className="text-gray-600 dark:text-gray-300" />
        ) : (
          <FaRobot className="text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-lg ${isUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'} max-w-full overflow-x-auto`}>
          {isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Pensando...</span>
            </div>
          ) : (
            renderContent(message.content)
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 