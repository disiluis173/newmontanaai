'use client'

import React from 'react';
import { FaUser, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Message = ({ message, isUser, provider = 'deepseek', isStreaming = false }) => {
  const userBgColor = 'bg-blue-600 text-white';
  const botBgColor = provider === 'deepseek' 
    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-100 dark:border-purple-800/30' 
    : 'bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border border-blue-100 dark:border-blue-800/30';
  
  const botTextColor = provider === 'deepseek' 
    ? 'text-gray-800 dark:text-gray-200' 
    : 'text-gray-800 dark:text-gray-200';
    
  const botIconColor = provider === 'deepseek' 
    ? 'text-purple-500 dark:text-purple-400' 
    : 'text-blue-500 dark:text-blue-400';
  
  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
  };
  
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } }
  };

  return (
    <motion.div 
      className={`${isUser ? 'justify-end' : 'justify-start'} flex gap-2 mb-4 md:mb-6 px-2`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }}
    >
      {/* Avatar (solo visible en md y superior) */}
      {!isUser && (
        <motion.div variants={avatarVariants} className="hidden md:flex flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
          <FaRobot className={`text-lg ${botIconColor}`} />
        </motion.div>
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Nombre del remitente (solo visible en md y superior) */}
        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 ${isUser ? 'md:text-right' : 'md:text-left'}`}>
          {isUser ? 'Tú' : provider === 'deepseek' ? 'DeepSeek AI' : 'X.AI (Grok)'}
        </div>
        
        {/* Contenido del mensaje */}
        <motion.div 
          variants={messageVariants}
          className={`p-3 md:p-4 rounded-2xl shadow-sm ${
            isUser 
              ? `${userBgColor} rounded-br-none` 
              : `${botBgColor} ${botTextColor} rounded-bl-none`
          }`}
        >
          <div className="whitespace-pre-wrap prose-sm md:prose-base max-w-none dark:prose-invert">
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <>
                {isStreaming && (
                  <div className="mb-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Generando respuesta...</span>
                  </div>
                )}
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Avatar del usuario (solo visible en md y superior) */}
      {isUser && (
        <motion.div variants={avatarVariants} className="hidden md:flex flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
          <FaUser className="text-lg text-blue-500" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Message; 