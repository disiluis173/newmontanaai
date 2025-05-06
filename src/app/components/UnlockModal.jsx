'use client'

import React, { useState } from 'react';
import { FaLock, FaUnlock, FaEye, FaEyeSlash } from 'react-icons/fa';

const UnlockModal = ({ isOpen, onClose, onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Contraseña definida según requisitos
  const correctPassword = "Ful96050@";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === correctPassword) {
      onUnlock();
      onClose();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <FaLock className="text-amber-500" />
          Desbloquear Generador
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Has alcanzado el límite de 10 imágenes generadas por día. 
          Ingresa la contraseña para desbloquear generaciones ilimitadas.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña de desbloqueo"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-2"
            >
              <FaUnlock />
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnlockModal;
