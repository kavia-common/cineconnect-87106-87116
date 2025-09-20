import { useMemo, useState, useEffect, useCallback } from 'react';
import { useApi } from './Api';

/**
 * PUBLIC_INTERFACE
 * Reaction types supported by the UI.
 */
export const REACTION_TYPES = ['dislike', 'like', 'love', 'life changing'];

/**
 * PUBLIC_INTERFACE
 * getStoredReactions reads reactions map from localStorage.
 * Structure: { [videoId]: 'dislike'|'like'|'love'|'life changing' }
 */
export function getStoredReactions() {
  try {
    const raw = localStorage.getItem('cd_reactions');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // ignore
  }
  return {};
}

/**
 * PUBLIC_INTERFACE
 * setStoredReaction updates reaction for a video in localStorage.
 */
export function setStoredReaction(videoId, reaction) {
  if (!videoId) return;
  const current = getStoredReactions();
  if (!reaction) {
    // remove reaction
    delete current[videoId];
  } else {
    current[videoId] = reaction;
  }
  localStorage.setItem('cd_reactions', JSON.stringify(current));
  return current;
}

/**
 * PUBLIC_INTERFACE
 * useReactions provides helpers to get/set a reaction per video with optimistic localStorage update.
 * If backend endpoints are available, set env REACT_APP_API_BASE and implement the POST call below.
 */
export function useReactions() {
  const { post } = useApi();
  const [map, setMap] = useState(() => getStoredReactions());

  useEffect(() => {
    // In future we could load from API on boot and merge with local
    setMap(getStoredReactions());
  }, []);

  // PUBLIC_INTERFACE
  const getReaction = useCallback((videoId) => {
    return map[videoId] || null;
  }, [map]);

  // PUBLIC_INTERFACE
  const setReaction = useCallback(async (videoId, reaction) => {
    // Optimistic local update
    setMap(prev => {
      const next = { ...prev };
      if (reaction) next[videoId] = reaction;
      else delete next[videoId];
      return next;
    });
    setStoredReaction(videoId, reaction);

    // Optional: If backend exists, try to persist (ignore errors)
    // Expected endpoint (example): POST /films/:id/reactions { reaction }
    try {
      if (process.env.REACT_APP_API_BASE) {
        await post(`/films/${videoId}/reactions`, { reaction });
      }
    } catch {
      // ignore; we keep local state
    }
  }, [post]);

  return useMemo(() => ({ map, getReaction, setReaction }), [map, getReaction, setReaction]);
}
