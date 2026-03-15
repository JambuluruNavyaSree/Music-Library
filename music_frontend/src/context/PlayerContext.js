import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { recordPlay } from '../services/api.js';

const PlayerContext = createContext(null);
const BACKEND = 'http://localhost:5000';

const buildSrc = (filePath) => {
  if (!filePath) return '';
  const fp = String(filePath).replace(/\\/g, '/');
  if (fp.startsWith('http')) return fp;
  const clean = fp.startsWith('/') ? fp.slice(1) : fp;
  return `${BACKEND}/${encodeURI(clean)}`;
};

// Singleton audio element — lives outside React to avoid StrictMode double-create
let _audio = null;
const getAudio = () => {
  if (!_audio) {
    _audio = new Audio();
    _audio.preload = 'auto';
    _audio.volume  = 0.8;
  }
  return _audio;
};

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue]               = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isRepeat, setIsRepeat]         = useState(false);
  const [isShuffle, setIsShuffle]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(0.8);

  const queueRef        = useRef([]);
  const currentIndexRef = useRef(0);
  const isRepeatRef     = useRef(false);
  const isShuffleRef    = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { queueRef.current = queue; },         [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { isRepeatRef.current = isRepeat; },   [isRepeat]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);

  const currentSong = queue[currentIndex] || null;

  // ── Audio event listeners (mounted once) ─────────────────────────────────
  useEffect(() => {
    const audio = getAudio();

    const onTime     = () => setProgress(audio.currentTime);
    const onDuration = () => { if (!isNaN(audio.duration)) setDuration(audio.duration); };
    const onEnded    = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // advance queue using refs (no stale closure)
        const q   = queueRef.current;
        const ci  = currentIndexRef.current;
        if (q.length === 0) return;
        const next = isShuffleRef.current
          ? Math.floor(Math.random() * q.length)
          : (ci + 1) % q.length;
        setCurrentIndex(next);
        currentIndexRef.current = next;
        const song = q[next];
        audio.src = buildSrc(song?.filePath);
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
    };
    const onError = () => {
      const code = audio.error?.code;
      const msgs = { 1:'Aborted',2:'Network error',3:'Decode error',4:'Not supported' };
      const msg  = msgs[code] || 'Unknown error';
      console.error('[Player] Audio error code', code, audio.src);
      toast.error(`Playback error: ${msg} — ${audio.src}`);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate',    onTime);
    audio.addEventListener('durationchange',onDuration);
    audio.addEventListener('ended',         onEnded);
    audio.addEventListener('error',         onError);
    return () => {
      audio.removeEventListener('timeupdate',    onTime);
      audio.removeEventListener('durationchange',onDuration);
      audio.removeEventListener('ended',         onEnded);
      audio.removeEventListener('error',         onError);
    };
  }, []); // mount once only

  // ── Volume sync ───────────────────────────────────────────────────────────
  useEffect(() => { getAudio().volume = volume; }, [volume]);

  // ── play a specific song in a queue ──────────────────────────────────────
  const _play = useCallback((songs, index) => {
    const song = songs[index];
    if (!song) { toast.error('No song found'); return; }
    if (!song.filePath) {
      toast.error(`No file for "${song.songName}" — contact admin`);
      console.warn('[Player] Missing filePath on song:', song);
      return;
    }

    const src = buildSrc(song.filePath);
    console.log('[Player] Playing:', src, '| song:', song.songName);

    const audio = getAudio();
    audio.pause();
    audio.src = src;

    // Use the promise returned by play() directly — no canplay listener needed
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        setIsPlaying(true);
        console.log('[Player] Playback started ✓');
        recordPlay(song._id).catch(() => {}); // silently record play history
      }).catch(err => {
        console.error('[Player] play() error:', err.name, err.message);
        if (err.name === 'NotAllowedError') {
          toast.error('Browser blocked autoplay — click the ▶ button to start');
        } else {
          toast.error(`Cannot play: ${err.message}`);
        }
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(true);
    }
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────
  const playSong = useCallback((songs, index = 0) => {
    setQueue(songs);
    setCurrentIndex(index);
    queueRef.current        = songs;
    currentIndexRef.current = index;
    _play(songs, index);
  }, [_play]);

  const togglePlay = useCallback(() => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const playNext = useCallback(() => {
    const q  = queueRef.current;
    const ci = currentIndexRef.current;
    if (q.length === 0) return;
    const next = isShuffleRef.current
      ? Math.floor(Math.random() * q.length)
      : (ci + 1) % q.length;
    setCurrentIndex(next);
    currentIndexRef.current = next;
    _play(q, next);
  }, [_play]);

  const playPrev = useCallback(() => {
    const q  = queueRef.current;
    const ci = currentIndexRef.current;
    if (q.length === 0) return;
    const prev = ci === 0 ? q.length - 1 : ci - 1;
    setCurrentIndex(prev);
    currentIndexRef.current = prev;
    _play(q, prev);
  }, [_play]);

  const seek = useCallback((time) => {
    getAudio().currentTime = time;
    setProgress(time);
  }, []);

  const toggleRepeat  = useCallback(() => { 
    setIsRepeat(prev => {
      const next = !prev;
      isRepeatRef.current = next;
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => { 
    setIsShuffle(prev => {
      const next = !prev;
      isShuffleRef.current = next;
      return next;
    });
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, isRepeat, isShuffle, progress, duration, volume,
      queue, currentIndex,
      playSong, togglePlay, stop, playNext, playPrev, seek,
      toggleRepeat, toggleShuffle, setVolume
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
