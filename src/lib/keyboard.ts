import { useEffect, useState, type KeyboardEvent } from 'react';
import { isMac } from './system';

type KeyboardModifiers = {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

/**
 * Submit forms on CTRL + Enter or CMD + Enter
 *
 * Usage: <form onKeyDown={onCtrlEnter(...)} />
 * - We have to use onKeyDown, otherwise the metaKey is not set on Mac
 *
 */
export function onCtrlEnter<T>(fn: () => unknown) {
  return (e: KeyboardEvent<T>) => {
    /** CTRL + Enter and CMD + Enter */
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fn();
    }
  };
}
export function onCtrlBackspace(fn: () => void) {
  return (e: KeyboardEvent) => {
    /** CTRL + Backspace and CMD + Backspace */
    if (e.key === 'Backspace' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fn();
    }
  };
}
export function onEnter(fn: () => void) {
  return (e: KeyboardEvent) => {
    /** Enter without CTRL or CMD */
    if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fn();
    }
  };
}

export function onEscape(fn: () => void) {
  return (e: KeyboardEvent) => {
    /** Escape */
    if (e.key === 'Escape') {
      e.preventDefault();
      fn();
    }
  };
}

/**
 * Create custom listener for keyboard shortcuts
 * Modifiers are optional
 * Example: <div onKeyDown={onKeyboardShortcut('s', { ctrlKey: true }, () => console.log('CTRL + S'))} />
 * Example: <div onKeyDown={onKeyboardShortcut('s', { ctrlKey: true, metaKey: true }, () => console.log('CMD + S'))} />
 */
export function onKeyboardShortcut(key: string, modifiers: KeyboardModifiers, fn: () => void) {
  return (e: KeyboardEvent) => {
    if (
      e.key.toLowerCase() === key.toLowerCase() &&
      (modifiers.ctrlKey ? e.ctrlKey || e.metaKey : true) &&
      (modifiers.metaKey ? e.metaKey : true) &&
      (modifiers.shiftKey ? e.shiftKey : true)
    ) {
      e.preventDefault();
      fn();
    }
  };
}

/**
 * Allow to specify multiple key handlers from above
 */
export function onKeys(...fns: ((e: KeyboardEvent) => void)[]) {
  return (e: KeyboardEvent) => {
    for (const fn of fns) {
      if (!e.defaultPrevented) {
        fn(e);
      }
    }
  };
}

// Display ⌘ on Mac or Ctrl on Windows
export function getKeyboardShortcut(key: string, modifiers: KeyboardModifiers) {
  const modifierKeys: string[] = [];
  if (modifiers.ctrlKey) {
    modifierKeys.push('Ctrl');
  }
  if (modifiers.metaKey) {
    modifierKeys.push('⌘');
  }
  if (modifiers.shiftKey) {
    modifierKeys.push('Shift');
  }
  return `${modifierKeys.join(' + ')} + ${key}`;
}

export function getMacWinKeyboardShortcut(key: string) {
  return `${isMac() ? '⌘' : 'Ctrl+'}${key}`;
}

export function useMacWinKeyboardShortcut(key: string) {
  'use client';
  const [shortcut, setShortcut] = useState(`Ctrl+${key}`); // Default for SSR

  useEffect(() => {
    setShortcut(isMac() ? `⌘${key}` : `Ctrl+${key}`);
  }, [key]);

  return shortcut;
}
