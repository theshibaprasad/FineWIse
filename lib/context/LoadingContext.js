"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-spinner';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [loadingVariant, setLoadingVariant] = useState('spinner');

  const showLoading = useCallback((text = 'Loading...', variant = 'spinner') => {
    setLoadingText(text);
    setLoadingVariant(variant);
    setGlobalLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingText('Loading...');
  }, []);

  const withLoading = useCallback(async (asyncFn, text = 'Loading...', variant = 'spinner') => {
    try {
      showLoading(text, variant);
      const result = await asyncFn();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={{ 
      globalLoading, 
      loadingText, 
      loadingVariant,
      showLoading, 
      hideLoading, 
      withLoading 
    }}>
      {children}
      <LoadingOverlay 
        isLoading={globalLoading}
        text={loadingText}
        variant={loadingVariant}
      />
    </LoadingContext.Provider>
  );
}; 