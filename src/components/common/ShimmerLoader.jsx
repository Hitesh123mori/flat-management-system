// src/components/common/ShimmerLoader.jsx
import React from 'react';

const ShimmerLoader = ({ type = 'card', count = 1, className = '' }) => {
  const renderShimmer = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        );
      
      case 'table-row':
        return (
          <tr className={`border-b border-gray-200 ${className}`}>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
            </td>
          </tr>
        );
      
      case 'stats':
        return (
          <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`bg-white rounded-lg p-4 border border-gray-200 mb-3 ${className}`}>
            <div className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`h-20 bg-gray-300 rounded animate-pulse ${className}`}></div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderShimmer()}
        </div>
      ))}
    </div>
  );
};

export default ShimmerLoader;