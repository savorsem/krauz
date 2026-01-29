/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface SwipeContainerProps {
  children: React.ReactNode;
}

const SwipeContainer: React.FC<SwipeContainerProps> = ({ children }) => {
  const { isPlanPanelOpen, setIsPlanPanelOpen, isChatPanelOpen, setIsChatPanelOpen } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance required
  const minSwipeDistance = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isChatPanelOpen && !isPlanPanelOpen) {
      // Swipe left opens AI Chat
      setIsChatPanelOpen(true);
    } else if (isRightSwipe && !isPlanPanelOpen && !isChatPanelOpen) {
      // Swipe right opens Plan Panel
      setIsPlanPanelOpen(true);
    } else if (isRightSwipe && isChatPanelOpen) {
      // Swipe right closes Chat
      setIsChatPanelOpen(false);
    } else if (isLeftSwipe && isPlanPanelOpen) {
      // Swipe left closes Plan
      setIsPlanPanelOpen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsChatPanelOpen(false);
        setIsPlanPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsChatPanelOpen, setIsPlanPanelOpen]);

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 relative overflow-hidden"
    >
      {children}
    </div>
  );
};

export default SwipeContainer;
