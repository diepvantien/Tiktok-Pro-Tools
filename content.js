
// TikTok Pro Tools - Content Script v12
  (function () {
    'use strict';
    if (window.__tptLoaded) return;
    window.__tptLoaded = true;

    // ─── INJECT AUDIO/PLAY HOOKS (WEB ACCESSIBLE) ──────────────────────────────
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('hook.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);


  
  
    let cfg = {
      backgroundPlay: true,
      autoPauseAudio: true,
      autoScroll: false,
      speed: 1, 
      eq: 'normal',
      eqBass: 0,
      eqMid: 0,
      eqTreble: 0,
      cleanMode: false,
      unlockShop: false,
      blockKeywords: '',
      volNorm: false,
      autoPiP: true,
      audio360: false
    };

  // ─── CAPTURE ORIGINALS ───────────────────────────────────────────────────────
  


  const _origPause = HTMLVideoElement.prototype.pause;
  const _origPlay  = HTMLVideoElement.prototype.play;

  // Snapshot the real getter BEFORE we override it
  const _realHiddenGetter = (() => {
    const d = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    return d && d.get ? d.get : null;
  })();
  const _realVisGetter = (() => {
    const d = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
    return d && d.get ? d.get : null;
  })();

  function _isReallyHidden() {
    return _realHiddenGetter ? _realHiddenGetter.call(document) : false;
  }

    // ─── BACKGROUND PLAY ─────────────────────────────────────────────────────────
  let _bgEnabled = false;

  const _stopEvent = (e) => {
      if (cfg.backgroundPlay && e.isTrusted) {
          e.stopImmediatePropagation();
      }
  };

  function enableBgPlay() {
    if (_bgEnabled) return;
    _bgEnabled = true;

    try {
      Object.defineProperty(document, 'hidden', {
        get() { return cfg.backgroundPlay ? false : (_realHiddenGetter ? _realHiddenGetter.call(document) : false); },
        configurable: true
      });
      Object.defineProperty(document, 'visibilityState', {
        get() { return cfg.backgroundPlay ? 'visible' : (_realVisGetter ? _realVisGetter.call(document) : 'visible'); },
        configurable: true
      });
    } catch (_) {}

    // Thay vì chặn pause() làm hỏng Auto-Scroll, ta chặn luôn không cho Tiktok biết người dùng rời Tab
    window.addEventListener('visibilitychange', _stopEvent, true);
    document.addEventListener('visibilitychange', _stopEvent, true);
    window.addEventListener('pagehide', _stopEvent, true);
    window.addEventListener('blur', _stopEvent, true);
  }

  function disableBgPlay() {
    cfg.backgroundPlay = false;
    _bgEnabled = false;
    window.removeEventListener('visibilitychange', _stopEvent, true);
    document.removeEventListener('visibilitychange', _stopEvent, true);
    window.removeEventListener('pagehide', _stopEvent, true);
    window.removeEventListener('blur', _stopEvent, true);
  }




  // ─── AUTO PAUSE ON OTHER AUDIO ────────────────────────────────────────────────

  // ─── SCREENSHOT ──────────────────────────────────────────────────────────────
  function captureFrame() {
    const v = _best(); if (!v || v.videoWidth === 0) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'tiktok-' + Date.now() + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  }

  
// ─── BACKGROUND RAF MOCK ─────────────────────────────────────────────────────
// TikTok's native Auto Scroll usually relies on requestAnimationFrame.
// In background tabs, rAF stops completely. We proxy it to setTimeout so native features keep working!
const _origRaf = window.requestAnimationFrame;
const _origCancelRaf = window.cancelAnimationFrame;
let rafPolyfillActive = false;


let _fadeInterval = null;
let _origVolume = 1;
let _pausedByExtension = false;

function fadeToPause() {
    const video = document.querySelector('video');
    if (!video || video.paused) return;
    clearInterval(_fadeInterval);
    _origVolume = video.volume > 0 ? video.volume : 1;
    _pausedByExtension = true;
    let v = video.volume;
    _fadeInterval = setInterval(() => {
        v -= 0.1;
        if (v <= 0) {
            clearInterval(_fadeInterval);
            video.volume = 0;
            video.pause();
        } else {
            video.volume = v;
        }
    }, 50);
}

function fadeToResume() {
    const video = document.querySelector('video');
    if (!video || !_pausedByExtension) return;
    _pausedByExtension = false;
    clearInterval(_fadeInterval);
    video.play().then(() => {
        let v = 0;
        video.volume = 0;
        _fadeInterval = setInterval(() => {
            v += 0.1;
            if (v >= _origVolume) {
                clearInterval(_fadeInterval);
                video.volume = _origVolume;
            } else {
                video.volume = v;
            }
        }, 50);
    }).catch(e => console.error("Fade resume error:", e));
}


function activateBackgroundRaf() {
    if (rafPolyfillActive) return;
    rafPolyfillActive = true;
    window.requestAnimationFrame = function(cb) {
        if (_isReallyHidden()) {
            // Tab is in background, proxy to setTimeout so it doesn't freeze
            return setTimeout(() => cb(performance.now()), 16);
        }
        return _origRaf.call(window, cb);
    };
    window.cancelAnimationFrame = function(id) {
        if (_isReallyHidden()) {
            clearTimeout(id);
        } else {
            _origCancelRaf.call(window, id);
        }
    };
}
activateBackgroundRaf();

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'other_audio_start' && cfg.autoPauseAudio) {
        fadeToPause();
    } else if (msg.action === 'other_audio_stop' && cfg.autoPauseAudio) {
        fadeToResume();
    }
});

// ─── AUDIO EQUALIZER ─────────────────────────────────────────────────────────
  const audioContextMap = new WeakMap();

  document.addEventListener('pointerdown', () => {
      document.querySelectorAll('video').forEach(v => {
          const nodes = audioContextMap.get(v);
          if (nodes && nodes.ctx && nodes.ctx.state === 'suspended') {
              nodes.ctx.resume().catch(()=>{});
          }
      });
  }, { capture: true });

  function applyEqToVideo(videoElement) {
    if (cfg.eq === 'normal' && !cfg.eqBass && !cfg.eqMid && !cfg.eqTreble && !cfg.volNorm && !cfg.audio360) return;

    if (!videoElement.hasAttribute('crossorigin')) {
        try { 
            videoElement.crossOrigin = "anonymous"; 
            // Cần force reload src nếu src đã chạy để nhận crossorigin (nếu không sẽ silence WebAudio)
            // Tuy nhiên reload sẽ giật khung hình, ta chỉ set trước. hook.js cũng có làm việc này.
        } catch(e){}
    }

    
    // Yêu cầu có tương tác người dùng mới bật AudioContext

    // Yêu cầu có tương tác người dùng mới bật AudioContext
    // Nhưng nếu return ở đây, nó sẽ không bao giờ khởi tạo cho video đang có!
    // -> Khởi tạo ở trạng thái suspended, khi click sẽ resume


    if (videoElement._audioContextCreated) {
        let audioNodes = audioContextMap.get(videoElement);
        if (audioNodes) {
             // Continue to update EQ gains
        } else {
             return;
        }
    }
    
    if (!audioContextMap.has(videoElement)) {
      try {
        videoElement._audioContextCreated = true;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(videoElement);
        
        const bassNode = ctx.createBiquadFilter();
        bassNode.type = "lowshelf";
        bassNode.frequency.value = 250;
        
        const trebleNode = ctx.createBiquadFilter();
        trebleNode.type = "highshelf";
        trebleNode.frequency.value = 6000;
        
        const midNode = ctx.createBiquadFilter();
        midNode.type = "peaking";
        midNode.frequency.value = 1000;
        midNode.Q.value = 1;
        
        const compNode = ctx.createDynamicsCompressor();
        compNode.threshold.value = -24;
        compNode.knee.value = 30;
        compNode.ratio.value = 12;
        compNode.attack.value = 0.003;
        compNode.release.value = 0.25;

        // 360 Audio (8D) setup
        const pannerNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pannerNode) {
            if (!window._tptPanners) window._tptPanners = [];
            window._tptPanners.push(pannerNode);
            
            // Re-route with panner
            source.connect(compNode);
            compNode.connect(bassNode);
            bassNode.connect(midNode);
            midNode.connect(trebleNode);
            trebleNode.connect(pannerNode);
            pannerNode.connect(ctx.destination);
            
            audioContextMap.set(videoElement, { ctx, bassNode, midNode, trebleNode, compNode, pannerNode });
        } else {
            source.connect(compNode);
            compNode.connect(bassNode);
            bassNode.connect(midNode);
            midNode.connect(trebleNode);
            trebleNode.connect(ctx.destination);

            audioContextMap.set(videoElement, { ctx, bassNode, midNode, trebleNode, compNode });
        }
      } catch (e) {
        // Silently ignore if AudioContext fails (e.g. InvalidStateError in background or already connected)
        // console.debug("EQ init skipped for this video element");
      }
    }

    const audioNodes = audioContextMap.get(videoElement);
    if (!audioNodes) return;
    
    if (audioNodes.ctx.state === 'suspended') {
        if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
            audioNodes.ctx.resume().catch(() => {});
        }
    }

    audioNodes.bassNode.gain.value = 0;
    audioNodes.midNode.gain.value = 0;
    audioNodes.trebleNode.gain.value = 0;
    
    // Toggle dynamics compressor dynamically
    if (audioNodes.compNode) {
        if (cfg.volNorm) {
            audioNodes.compNode.threshold.value = -24; // Bắt đầu nén khi nguồn vượt âm lượng
            audioNodes.compNode.ratio.value = 8;
        } else {
            audioNodes.compNode.threshold.value = 0; // Bypass
            audioNodes.compNode.ratio.value = 1;
        }
    }

    switch (cfg.eq) {
      case 'bass':
        audioNodes.bassNode.gain.value = 12;
        audioNodes.trebleNode.gain.value = -3;
        break;
      case 'treble':
        audioNodes.trebleNode.gain.value = 12;
        audioNodes.bassNode.gain.value = -3;
        break;
      case 'vocal':
        audioNodes.midNode.gain.value = 8;
        audioNodes.bassNode.gain.value = -5;
        audioNodes.trebleNode.gain.value = 2;
        break;
      case 'advanced':
        audioNodes.bassNode.gain.value = cfg.eqBass || 0;
        audioNodes.midNode.gain.value = cfg.eqMid || 0;
        audioNodes.trebleNode.gain.value = cfg.eqTreble || 0;
        break;
      case 'normal':
      default:
        break;
    }
  }
  
  // ─── 360 AUDIO ANIMATION (8D) ────────────────────────────────────────────────
  let _panAngle = 0;
  setInterval(() => {
    if (!cfg.audio360 || !window._tptPanners) {
        if (window._tptPanners) {
            window._tptPanners.forEach(p => {
                if (p.pan.value !== 0) p.pan.value = 0;
            });
        }
        return;
    }
    _panAngle += 0.05; // speed of panning
    const panValue = Math.sin(_panAngle) * 0.8; // range -0.8 (left) to 0.8 (right)
    window._tptPanners.forEach(p => {
        try { p.pan.value = panValue; } catch(e){}
    });
  }, 50);

  // ─── CLEAN MODE ──────────────────────────────────────────────────────────────
  let tptStyleElement = null;

  function updateInjectedStyles() {
    if (!tptStyleElement) {
      tptStyleElement = document.createElement('style');
      tptStyleElement.id = 'tpt-injected-styles';
      document.head.appendChild(tptStyleElement);
    }
    
    let css = '';
    if (cfg.cleanMode) {
      css += `
        [data-e2e="video-desc"],
        [data-e2e="video-author-avatar"],
        [data-e2e="browser-nickname"],
        [data-e2e="video-music"],
        [class*="DivVideoInfoContainer"],
        [class*="DivMediaCardOverlayBottom"],
        [class*="DivActionItemContainer"],
        .tiktok-1vyw0v6-DivVideoInfoContainer,
        .tiktok-14bqk18-DivVideoContainer {
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease;
        }
      `;
    }
    
    tptStyleElement.textContent = css;
  }

  // ─── SHOP VIDEO UNBLOCKER ───────────────────────────────────────────────────
  let _shopFetching = new WeakSet();
  
  function checkShopVideos() {
    if (!cfg.unlockShop) return;
    
    // Tìm các container lớn có thể chứa video (bao gồm cả trường hợp TikTok xoá luôn thẻ video)
    const wrappers = document.querySelectorAll(
      '[class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="recommend-list-item-container"], .video-container'
    );
    
    wrappers.forEach(wrapper => {
      // Để tránh tìm trùng lớp cha-con, loại bỏ cha nếu có con tương tự
      if (wrapper.querySelector('[class*="DivVideoWrapper"]') && wrapper.className.includes('Container')) return;
      
      if (wrapper.dataset.tptShopFixed || _shopFetching.has(wrapper)) return;
      
      const rect = wrapper.getBoundingClientRect();
      const isVisible = rect.height > 0 && rect.top >= -500 && rect.bottom <= window.innerHeight + 500;
      if (!isVisible) return; 
      
      const vid = wrapper.querySelector('video');
      
      // Phát hiện video bị chặn (không có thẻ <video>, hoặc có nhưng không có source/không phát được)
      const isBlocked = !vid || (!vid.src && !vid.currentSrc && !vid.querySelector('source')) || 
                        (vid.readyState === 0 && (!vid.hasAttribute('src') || vid.getAttribute('src') === ''));
      
      // Loại hẳn bài đăng ảnh cuộn bị nhận diện nhầm
      if (wrapper.querySelector('[class*="DivImageContainer"]') || wrapper.innerHTML.includes('photo')) {
          if (!vid) return; 
      }

      // Tiêu chí bổ sung: Chữ "Xem video" hoặc icon báo lỗi của tiktok
      const hasErrorText = /TikTok Shop|(video|Nội dung|content).*?(không khả dụng|bị giới hạn|unavailable|restricted|not available)/i.test(wrapper.innerText || "");

      if (isBlocked || (!vid && hasErrorText)) {
        let targetUrl = window.location.href;
        
        // Tìm URL chuẩn trong feed nếu có
        const container = wrapper.closest('[data-e2e="recommend-list-item-container"], [class*="DivItemContainer"]');
        if (container) {
          const aTag = container.querySelector('a[href*="/video/"], a[href*="/v/"]');
          if (aTag) targetUrl = aTag.href;
        }

        if (!targetUrl.includes('/video/') && !targetUrl.includes('/v/')) {
          return; // Loại cứng /photo/ để shop unlocker không chõ mõm vào ảnh
        }

        _shopFetching.add(wrapper);
        console.log("TPT: Detected blocked Shop Video, fetching bypass link...", targetUrl);
        
        const loader = document.createElement('div');
        loader.style.cssText = `
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85); color: white; display: flex; flex-direction: column;
          align-items: center; justify-content: center; z-index: 1000; font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(2px); border-radius: 8px;
        `;
        loader.innerHTML = `
          <div style="width:36px; height:36px; border:4px solid rgba(255,255,255,0.2); border-top-color:#fe2c55; border-radius:50%; animation:tpt-spin 1s linear infinite;"></div>
          <style>@keyframes tpt-spin { 100% { transform: rotate(360deg); } }</style>
          <div style="margin-top:14px; font-weight:600; font-size:13px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Opening TikTok Shop video...</div>
        `;
        
        if (window.getComputedStyle(wrapper).position === 'static') {
          wrapper.style.position = 'relative';
        }
        wrapper.appendChild(loader);

        chrome.runtime.sendMessage({ type: 'TIKWM_FETCH', url: targetUrl }, res => {
          if (res && res.ok && res.data && (res.data.play || res.data.hdplay)) {
            const realUrl = res.data.hdplay || res.data.play;
            
            const newVid = document.createElement('video');
            newVid.src = realUrl;
            newVid.crossOrigin = "anonymous";
            newVid.controls = true;
            newVid.autoplay = true;
            newVid.loop = true;
            newVid.muted = false;
            newVid.dataset.tptShopInjected = "true";
            newVid.style.cssText = `
              object-fit: contain; width: 100%; height: 100%;
              position: absolute; top: 0; left: 0; z-index: 999;
              background: #000; border-radius: 8px;
            `;
            
            wrapper.appendChild(newVid);
            if (vid) vid.remove(); 
            loader.remove(); 
            wrapper.dataset.tptShopFixed = "true";
            
            console.log("TPT: Shop Video unlocked with direct link!");
          } else {
            console.log("TPT: Failed to fetch bypass link", res);
            loader.innerHTML = `<div style="color:#ff3b30; font-weight:600; font-size:13px;">Cannot open this video! (API error)</div>`;
            setTimeout(() => {
              loader.remove();
              _shopFetching.delete(wrapper); 
            }, 3000);
          }
        });
      }
    });
  }

  
  

  // ─── VIDEO UTILS ─────────────────────────────────────────────────────────────
  function _best() {
    const all = [...document.querySelectorAll('video')];
    return all.find(v => !v.paused && v.readyState >= 2) || all.find(v => v.readyState >= 2) || all[0] || null;
  }

// ─── AUTO SCROLL (CUSTOM FIXED) ──────────────────────────────────────────────
function _logScroll(msg) {
    console.log(`[TPT-AutoScroll] ${new Date().toISOString()} - ${msg}`);
}


let _scrollCooldown = false;

function doScrollNext() {
    if (_scrollCooldown) return;
    _scrollCooldown = true;
    _logScroll("Attempting to scroll to the next video...");
    
    // Fallback un-pause in case it was paused
    const video = document.querySelector('video');
    if (video && video.paused && !video.dataset.pausedByExtension) video.play().catch(()=>{});

    // 1. Try finding the standard "Down/Next" arrow in the feed
    const btnDown = document.querySelector('[data-e2e="arrow-right"]') 
                 || document.querySelector('[data-e2e="arrow-down"]') 
                 || document.querySelector('button[data-e2e="video-switch-next"]');
    if (btnDown) {
        _logScroll("Found next button, clicking it.");
        btnDown.click();
    } else {
        // 2. Try smooth scrolling
        _logScroll("Next button not found, falling back to window.scrollBy.");
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        
        // 3. Try the keyboard fallback (ArrowDown) targeting a valid DOM element with a tagName
        _logScroll("Next button not found, trying KeyboardEvent (ArrowDown).");
        const e = new KeyboardEvent('keydown', { 
            key: 'ArrowDown', 
            code: 'ArrowDown', 
            keyCode: 40, 
            which: 40, 
            bubbles: true, 
            cancelable: true,
            composed: true,
            view: window
        });
        
        const targetElement = (video ? video.closest('[data-e2e="recommend-list-item-container"]') : null) 
                            || document.getElementById('app') 
                            || document.documentElement;
                            
        targetElement.dispatchEvent(e);
        _logScroll("Keyboard event dispatched on: " + targetElement.tagName);
    }
    
    setTimeout(() => { _scrollCooldown = false; }, 2000);
}

function doScrollPrev() {
    if (_scrollCooldown) return;
    _scrollCooldown = true;
    _logScroll("Attempting to scroll to the previous video...");
    
    const btnUp = document.querySelector('[data-e2e="arrow-left"]') 
               || document.querySelector('[data-e2e="arrow-up"]') 
               || document.querySelector('button[data-e2e="video-switch-prev"]');
    if (btnUp) {
        btnUp.click();
    } else {
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
        const e = new KeyboardEvent('keydown', { 
            key: 'ArrowUp', 
            code: 'ArrowUp', 
            keyCode: 38, 
            which: 38, 
            bubbles: true, 
            cancelable: true,
            composed: true,
            view: window
        });
        const video = document.querySelector('video');
        const targetElement = (video ? video.closest('[data-e2e="recommend-list-item-container"]') : null) 
                            || document.getElementById('app') 
                            || document.documentElement;
                            
        targetElement.dispatchEvent(e);
    }
    
    setTimeout(() => { _scrollCooldown = false; }, 2000);
}

function handleVideoTimeUpdate(e) {
    const v = e.target;
    if (!cfg.autoScroll) return;

    // Check if the current video is actually visible (ignore background hidden videos)
    const rect = v.getBoundingClientRect();
    const isVisible = rect.top >= -100 && rect.top <= window.innerHeight / 2;
    if (!isVisible) return;

    if (!v._tptLastTime) v._tptLastTime = 0;
    
    if (v.duration > 0) {
        const timeDiff = v.currentTime - v._tptLastTime;
        // Check loop jump
        if (timeDiff < -1.0 && v._tptLastTime >= v.duration - 0.5) {
            _logScroll(`Video looped (AutoScroll triggered). Duration: ${v.duration.toFixed(2)}, Previous: ${v._tptLastTime.toFixed(2)} -> Current: ${v.currentTime.toFixed(2)}`);
            doScrollNext();
        }
        // Force ended if within 0.1s and not looping
        else if (!v.loop && v.currentTime >= v.duration - 0.1 &&!_scrollCooldown) {
            _logScroll(`Video ending (AutoScroll triggered). Duration: ${v.duration.toFixed(2)}, Current: ${v.currentTime.toFixed(2)}`);
            doScrollNext();
        }
    }
    v._tptLastTime = v.currentTime;
}


function setupAutoScrollFeature(v) {
    if (v.dataset.tptHasAutoScroll) return;
    v.dataset.tptHasAutoScroll = "true";
    _logScroll("Hooking timeupdate event to video: " + (v.src ? v.src.substring(0, 30) : "unknown blob"));
    
    v.addEventListener('timeupdate', handleVideoTimeUpdate);
    v.addEventListener('ended', (e) => {
        if (!cfg.autoScroll) return;
        _logScroll("Video ended natively (ended event).");
        doScrollNext();
    });
}

// ═══════════════════════════════════════════
//  ĐĂNG KÝ AUTO PIP MEDIA SESSION CHROME
// ═══════════════════════════════════════════
let autoPiPSupported = false;

function initMediaSessionPiP() {
    if (!('mediaSession' in navigator)) {
        console.log('[TPT-PiP] Trình duyệt không hỗ trợ Media Session');
        return;
    }

    try {
        navigator.mediaSession.setActionHandler('enterpictureinpicture', async () => {
            if (!cfg.autoPiP) return;
            const video = _best();
            if (!video) return;

            video.removeAttribute('disablepictureinpicture');
            video.disablePictureInPicture = false;

            try {
                await video.requestPictureInPicture();
                console.log('[TPT-PiP] ✅ Auto PiP đã bật thành công via Chrome Native');
            } catch (e) {
                console.log('[TPT-PiP] Lỗi mở PiP:', e.message);
                fallbackPiPBtn();
            }
        });
        
        // Đăng ký Next/Prev Track bằng Media Session để bấm/cuộn qua media keys/PiP UI
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('[TPT-PiP] User triggered Next Track from PiP / Media keys');
            doScrollNext();
            setTimeout(updateMediaSession, 100);
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('[TPT-PiP] User triggered Prev Track from PiP / Media keys');
            doScrollPrev();
            setTimeout(updateMediaSession, 100);
        });

        // Hỗ trợ bắt Wheel (Cuộn chuột) ngay trong cửa sổ PiP. 
        // Chrome 115+ sẽ tự động chuyển tiếp event wheel đè lên PiP window trả về cho thẻ video gốc đang chiếm PiP
        window.addEventListener('wheel', (e) => {
            if (document.pictureInPictureElement) {
                // Chỉ nhận scroll nếu con trỏ chuột nằm trên cửa sổ PiP -> Wheel event routing vào document.pictureInPictureElement
                if (e.target === document.pictureInPictureElement) {
                    if (Math.abs(e.deltaY) > 10) {
                        e.preventDefault(); // Tránh cuộn lung tung trên trang mẹ
                        if (e.deltaY > 0) doScrollNext();
                        else doScrollPrev();
                        setTimeout(updateMediaSession, 100);
                    }
                }
            }
        }, {passive: false});

        autoPiPSupported = true;
        console.log('[TPT-PiP] ✅ Đã đăng ký Media Session Auto PiP Handler');
    } catch (e) {
        autoPiPSupported = false;
        console.log('[TPT-PiP] ⚠️ Media Session Handler bị lỗi:', e.message);
    }
}

function updateMediaSession() {
    if (!cfg.autoPiP || !autoPiPSupported) return;
    const video = _best();
    if (!video) return;

    if (!document.pictureInPictureElement) {
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'TikTok Pro Tools',
                artist: 'Auto PiP Enabled',
                artwork: []
            });
            navigator.mediaSession.playbackState = video.paused ? 'paused' : 'playing';
        } catch(e) {}
    }
}

function setupAutoPiPVideo(v) {
    if (!v.dataset.tptPipHooked) {
        v.dataset.tptPipHooked = 'true';
        v.addEventListener('playing', () => {
            if (cfg.autoPiP && document.pictureInPictureElement && document.pictureInPictureElement !== v) {
                console.log('[TPT-PiP] Tự động chuyển PiP sang video mới.');
                v.requestPictureInPicture().catch(console.error);
            }
        });
    }
    if (!cfg.autoPiP) {
        v.removeAttribute('autopictureinpicture');
        try { v.autoPictureInPicture = false; } catch(e) {}
        return;
    }
    v.setAttribute('autopictureinpicture', 'true');
    v.removeAttribute('disablepictureinpicture');
    try { 
        v.autoPictureInPicture = true; 
        v.disablePictureInPicture = false; 
    } catch(e) {}
}

function fallbackPiPBtn() {
    try {
        const btn = document.querySelector('[data-e2e="more-menu-popover_mini-player"]');
        if(btn) btn.click();
    } catch(e) {}
}


  const getUrlForVideo = (v) => {
      // Find the first parent that has an a tag with /video/, /v/ or /photo/
      let current = v;
      for (let i = 0; i < 15; i++) { // search up to 15 levels deep
          if (!current || current === document.body) break;
          const a = current.querySelector('a[href*="/video/"], a[href*="/v/"], a[href*="/photo/"]');
          if (a && a.href) return a.href.split('?')[0];
          current = current.parentElement;
      }
      
      // Broader search in common container prefixes
      let p = v.closest('div');
      while (p && p !== document.body) {
          const a = p.querySelector('a[href*="/video/"], a[href*="/v/"], a[href*="/photo/"]');
          if (a && a.href) return a.href.split('?')[0];
          p = p.parentElement;
      }

      const fallbackUrl = location.href.split('?')[0]; 
      if (fallbackUrl.includes('/video/') || fallbackUrl.includes('/v/') || fallbackUrl.includes('/photo/')) {
          return fallbackUrl;
      }
      return null;
  };

  const getTitleForVideo = (v) => {
      let p = v.closest('div[class*="DivItemContainer"], div[data-e2e="recommend-list-item-container"]');
      if (p) {
          const desc = p.querySelector('[data-e2e="video-desc"]');
          if (desc) return desc.textContent.trim();
      }
      return document.title.split('|')[0].trim();
  };


function _applyAll() {
    updateMediaSession();
    document.querySelectorAll('video').forEach(v => {
      // 4. Force Unmute dynamically once if we automatically muted it
        if (v.dataset.tptAutoMuted === "true" && navigator.userActivation && navigator.userActivation.hasBeenActive) {
            v.muted = false;
            delete v.dataset.tptAutoMuted;
            if (v.volume === 0) v.volume = 1;
            v.play().catch(()=>{});
        }
        
        if (Math.abs(v.playbackRate - cfg.speed) > 0.05) v.playbackRate = cfg.speed;
      setupAutoScrollFeature(v);
      applyEqToVideo(v);
      setupAutoPiPVideo(v);
      
      // Stop out-of-view injected shop videos
      if (v.dataset.tptShopInjected) {
          const rect = v.getBoundingClientRect();
          const isVisible = rect.height > 0 && rect.top >= -500 && rect.bottom <= window.innerHeight + 500;
          if (!isVisible && !v.paused) v.pause();
          else if (isVisible && v.paused && !document.pictureInPictureElement) v.play().catch(()=>{});
      }
    });
    updateInjectedStyles();
    checkShopVideos();
  }
  function _setSpeed(val) { cfg.speed  = +val; _applyAll(); chrome.storage.sync.set({ speed: cfg.speed }); }

  new MutationObserver(_applyAll).observe(document.body, { childList: true, subtree: true });
  let _lastHref = location.href;
  setInterval(() => { if (location.href !== _lastHref) { _lastHref = location.href; setTimeout(_applyAll, 900); } }, 500);

  // ─── MESSAGES ────────────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'PING') return;
    if (msg.type === 'CAPTURE_FRAME') { captureFrame(); return; }
    if (msg.type === 'UPDATE_SETTINGS') {
      const s = msg.settings;
      if (s.backgroundPlay !== undefined) { cfg.backgroundPlay = s.backgroundPlay; s.backgroundPlay ? enableBgPlay() : disableBgPlay(); }
      if (s.speed !== undefined) _setSpeed(s.speed);
      if (s.eq !== undefined) { cfg.eq = s.eq; _applyAll(); }
      if (s.eqBass !== undefined) { cfg.eqBass = s.eqBass; _applyAll(); }
      if (s.eqMid !== undefined) { cfg.eqMid = s.eqMid; _applyAll(); }
      if (s.eqTreble !== undefined) { cfg.eqTreble = s.eqTreble; _applyAll(); }
      if (s.cleanMode !== undefined) { cfg.cleanMode = s.cleanMode; _applyAll(); }
      if (s.unlockShop !== undefined) { cfg.unlockShop = s.unlockShop; _applyAll(); }
      if (s.autoScroll !== undefined) { cfg.autoScroll = s.autoScroll; _applyAll(); }
      if (s.autoPiP !== undefined) { cfg.autoPiP = s.autoPiP; _applyAll(); }
          if (s.blockKeywords !== undefined) { cfg.blockKeywords = s.blockKeywords; _applyAll(); }
    if (s.autoPauseAudio !== undefined) { cfg.autoPauseAudio = s.autoPauseAudio; }
    if (s.audio360 !== undefined) { cfg.audio360 = s.audio360; _applyAll(); }
    if (s.volNorm !== undefined) { cfg.volNorm = s.volNorm; _applyAll(); }
    }
  });

  // Fallback Interval để rà quét các chức năng (kể cả khi tab bị chrome làm chậm ngầm)
  setInterval(() => {
    // OVERRIDE: Chặn từ khoá rà soát liên tục
    if (cfg.blockKeywords && cfg.blockKeywords.trim()) {
      const kws = cfg.blockKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
      if (kws.length > 0) {
        document.querySelectorAll('[data-e2e="recommend-list-item-container"], [class*="DivItemContainer"], [data-e2e="search-card-video-caption"]').forEach(el => {
          if (el.dataset.tptBlocked) return;
          const textContext = el.textContent.toLowerCase();
          
          if (kws.some(kw => textContext.includes(kw))) {
            el.dataset.tptBlocked = "true";
            el.style.opacity = '0.05';
            el.style.height = '0px';
            el.style.overflow = 'hidden';
            el.style.pointerEvents = 'none';

            const vid = el.querySelector('video');
            if (vid && !vid.paused) {
                vid.muted = true;
                vid.pause();
                const nextBtn = document.querySelector('[data-e2e="arrow-right"]');
                if (nextBtn) nextBtn.click();
            }
          }
        });

        document.querySelectorAll('[data-e2e="comment-level-1"], [data-e2e="comment-level-2"], [class*="DivCommentItemContainer"]').forEach(el => {
          if (el.dataset.tptBlocked) return;
          if (kws.some(kw => el.textContent.toLowerCase().includes(kw))) {
            el.dataset.tptBlocked = "true";
            el.style.display = 'none';
          }
        });
      }
    }
  }, 800); // 800ms đủ an toàn để Chrome không vứt hẳn, mà đủ nhanh để bắt sự kiện skip

  // ─── INIT ────────────────────────────────────────────────────────────────────
  chrome.storage.sync.get(null, data => {
    cfg = Object.assign(cfg, data);
    if (cfg.backgroundPlay) enableBgPlay();
    setTimeout(initMediaSessionPiP, 500);
        _applyAll();
  });
})();

