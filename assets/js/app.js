// ==========================================
// 🎵 YOUR LOCAL DIGITAL MIXTAPE
// ==========================================

const trackList = [
    { title: "purple", artist: "Olivia Rodrigo", file: "assets/audio/purple.mp3" },
    { title: "Lavender Haze", artist: "Taylor Swift", file: "assets/audio/lavender_haze.mp3" },
    { title: "Dimple", artist: "BTS", file: "assets/audio/dimple.mp3" },
    { title: "Adore You", artist: "Harry Styles", file: "assets/audio/adore_you.mp3" },
    { title: "Lovers", artist: "Anna of the North", file: "assets/audio/lovers.mp3" },
    { title: "Treasure", artist: "Bruno Mars", file: "assets/audio/treasure.mp3" },
    { title: "Cruel Summer", artist: "Taylor Swift", file: "assets/audio/cruel_summer.mp3" },
    { title: "Levitating", artist: "Dua Lipa ft. DaBaby", file: "assets/audio/levitating.mp3" },
    { title: "One Thing", artist: "One Direction", file: "assets/audio/one_thing.mp3" },
    { title: "What Makes You Beautiful", artist: "One Direction", file: "assets/audio/what_makes_you_beautiful.mp3" },
    { title: "Pink + White", artist: "Frank Ocean", file: "assets/audio/pink_and_white.mp3" },
    { title: "Enchanted (Taylor's Version)", artist: "Taylor Swift", file: "assets/audio/enchanted_taylors_version.mp3" },
    { title: "Birds of a Feather", artist: "Billie Eilish", file: "assets/audio/birds_of_a_feather.mp3" },
    { title: "Aphrodite", artist: "The Ridleys", file: "assets/audio/aphrodite.mp3" },
    { title: "Moonlight", artist: "Dhruv", file: "assets/audio/moonlight.mp3" },
    { title: "How Would You Feel", artist: "Ed Sheeran", file: "assets/audio/how_would_you_feel.mp3" },
    { title: "Style", artist: "Taylor Swift", file: "assets/audio/style.mp3" },
    { title: "Your Love", artist: "The Outfield", file: "assets/audio/your_love.mp3" },
    { title: "Talk", artist: "Khalid ft. Disclosure", file: "assets/audio/talk.mp3" },
    { title: "Sucker", artist: "Jonas Brothers", file: "assets/audio/sucker.mp3" },
    { title: "Into You", artist: "Ariana Grande", file: "assets/audio/into_you.mp3" },
    { title: "A Whole New World", artist: "Mena Massoud, Naomi Scott", file: "assets/audio/a_whole_new_world.mp3" },
    { title: "Love Me Harder", artist: "Ariana Grande, The Weeknd", file: "assets/audio/love_me_harder.mp3" },
    { title: "Put It All On Me", artist: "Ed Sheeran, Ella Mai", file: "assets/audio/put_it_all_on_me.mp3" }
];

// ==========================================
// 🎞️ SPRITE SHEET CONFIG
// ==========================================

// Note: frameWidth/frameHeight below are informational only — actual
// frame size and count are auto-detected at runtime from each loaded
// image's real dimensions (see drawFrame/playAnimation/setPixelState).
const spriteConfig = {
    idle: {
        src: "assets/images/pixel-art/Idle.png",
        frameWidth: 128,
        frameHeight: 128,
        frames: 1
    },
    playing: {
        src: "assets/images/pixel-art/Box3.png",
        frameWidth: 128,
        frameHeight: 128,
        frames: 6
    },
    cat: {
        src: "assets/images/pixel-art/drculacat.png",
        frameWidth: 128,
        frameHeight: 128,
        frames: 8
    }
};

// ==========================================
// 🎮 STATE
// ==========================================

let currentTrackIndex = 0;
let isPlaying = false;
const audioEngine = new Audio();

// ==========================================
// 🎯 DOM (CANVAS)
// ==========================================

const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackTitleText = document.getElementById("track-title-text");
const trackArtistText = document.getElementById("track-artist-text");
const canvas = document.getElementById("pixel-animation");
const playlistContainer = document.getElementById("playlist");

// Initialize canvas
if (canvas) {
    canvas.width = 96;
    canvas.height = 96;
}
const ctx = canvas ? canvas.getContext("2d") : null;

// ==========================================
// 🖼️ LOAD SPRITES
// ==========================================

const sprites = {};

function loadSprite(key) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            sprites[key] = img;
            console.log(`✅ Loaded sprite: ${key}`, img.width, 'x', img.height);
            resolve();
        };
        img.onerror = () => {
            console.error(`❌ Failed to load sprite: ${key}`);
            reject();
        };
        img.src = spriteConfig[key].src;
    });
}

const loadAllSprites = Promise.all(
    Object.keys(spriteConfig).map(key => loadSprite(key))
);

// ==========================================
// 🎞️ ANIMATION ENGINE
// ==========================================

let currentState = "idle";
let frameIndex = 0;
let interval = null;

function stopAnimation() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function drawFrame(state, frame) {
    if (!ctx || !canvas) return;
    
    const cfg = spriteConfig[state];
    const img = sprites[state];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!cfg || !img || !img.complete) {
        // Draw placeholder
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵', canvas.width/2, canvas.height/2);
        return;
    }

    // Auto-detect frame size and count from the real image instead of
    // hardcoded config. These sheets are single-row strips where each
    // frame is square and exactly as tall as the image itself, so:
    //   frame size  = img.height
    //   frame count = img.width / img.height
    const fh = img.height;
    const fw = img.height;
    const totalFrames = Math.max(1, Math.round(img.width / img.height));
    const frameToUse = frame % totalFrames;

    ctx.drawImage(
        img,
        frameToUse * fw, 0,
        fw, fh,
        0, 0,
        canvas.width,
        canvas.height
    );
}

function playAnimation(state, speed = 120) {
    stopAnimation();

    currentState = state;
    frameIndex = 0;

    const cfg = spriteConfig[state];
    const img = sprites[state];

    if (!img || !img.complete) {
        setTimeout(() => playAnimation(state, speed), 100);
        return;
    }

    const actualFrames = Math.max(1, Math.round(img.width / img.height));

    if (actualFrames === 1) {
        drawFrame(state, 0);
        return;
    }

    drawFrame(state, 0);
    interval = setInterval(() => {
        drawFrame(currentState, frameIndex);
        frameIndex = (frameIndex + 1) % actualFrames;
    }, speed);
}

// ==========================================
// 💜 PIXEL STATE SYSTEM
// ==========================================

function setPixelState(state) {
    const cfg = spriteConfig[state];
    if (!cfg || !ctx) return;

    const img = sprites[state];
    
    // Update container class
    const artDisplay = document.querySelector('.art-display');
    if (artDisplay) {
        artDisplay.classList.remove('idle', 'playing', 'cat');
        artDisplay.classList.add(state);
    }
    
    if (!img || !img.complete) {
        // Draw placeholder
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵', canvas.width/2, canvas.height/2);
        setTimeout(() => setPixelState(state), 100);
        return;
    }

    const actualFrames = Math.max(1, Math.round(img.width / img.height));

    if (actualFrames === 1) {
        stopAnimation();
        drawFrame(state, 0);
        return;
    }

    const speed = state === "playing" ? 150 : 200;
    playAnimation(state, speed);
}

// ==========================================
// 📜 MARQUEE (scrolling long titles/artists)
// ==========================================

const titleWrapper = trackTitle ? trackTitle.closest(".track-scroll-wrapper") : null;
const artistWrapper = trackArtist ? trackArtist.closest(".track-scroll-wrapper") : null;

function applyMarquee(wrapper, textEl) {
    if (!wrapper || !textEl) return;

    // Reset first so we measure natural (unscrolled) widths
    wrapper.classList.remove("marquee-scroll");
    textEl.style.removeProperty("--scroll-distance");
    textEl.style.removeProperty("--marquee-duration");

    // Force a reflow so scrollWidth reflects the new text immediately
    void textEl.offsetWidth;

    const wrapperWidth = wrapper.clientWidth;
    const textWidth = textEl.scrollWidth;
    const overflowAmount = textWidth - wrapperWidth;

    if (overflowAmount > 4) {
        const distance = overflowAmount + 12; // small buffer past the edge
        const duration = Math.max(6, distance / 28); // px/sec speed, min 6s

        textEl.style.setProperty("--scroll-distance", `-${distance}px`);
        textEl.style.setProperty("--marquee-duration", `${duration}s`);
        wrapper.classList.add("marquee-scroll");
    }
}

function refreshMarquees() {
    applyMarquee(titleWrapper, trackTitleText);
    applyMarquee(artistWrapper, trackArtistText);
}

window.addEventListener("resize", () => {
    clearTimeout(window._marqueeResizeTimer);
    window._marqueeResizeTimer = setTimeout(refreshMarquees, 150);
});



// ==========================================
// 🎵 LOAD TRACK
// ==========================================

function loadTrack(index) {
    currentTrackIndex = index;
    const track = trackList[index];
    const detailsEl = document.querySelector(".track-details");

    if (detailsEl) detailsEl.classList.add("fade-out");

    if (trackTitleText) trackTitleText.textContent = track.title;
    if (trackArtistText) trackArtistText.textContent = track.artist;

    refreshMarquees();

    requestAnimationFrame(() => {
        if (detailsEl) detailsEl.classList.remove("fade-out");
    });

    audioEngine.src = track.file;
    updatePlaylistUI();

    if (isPlaying) {
        audioEngine.play().catch(() => {});
        setPixelState("playing");
    } else {
        setPixelState("idle");
    }
}

// ==========================================
// ▶ PLAY / PAUSE
// ==========================================

// SVG icons (fill: currentColor) instead of unicode glyphs — this avoids
// platform emoji-font rendering quirks (e.g. iOS Safari sometimes renders
// "⏸" as a colored emoji instead of plain text matching the button color,
// regardless of Unicode variation selectors).
const ICON_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3 1.5v13l11-6.5z" fill="currentColor"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><rect x="3" y="1.5" width="3.5" height="13" fill="currentColor"/><rect x="9.5" y="1.5" width="3.5" height="13" fill="currentColor"/></svg>';

function setPlayButtonIcon(playing) {
    if (!playBtn) return;
    playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
}

function togglePlay() {
    if (isPlaying) {
        audioEngine.pause();
        isPlaying = false;
        setPlayButtonIcon(false);
        setPixelState("idle");
    } else {
        audioEngine.play()
            .then(() => {
                isPlaying = true;
                setPlayButtonIcon(true);
                setPixelState("playing");
            })
            .catch(() => {});
    }
}

// ==========================================
// ⏭ TRACK SWITCH
// ==========================================

function changeTrack(dir) {
    if (dir === "next") {
        currentTrackIndex = (currentTrackIndex + 1) % trackList.length;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + trackList.length) % trackList.length;
    }

    loadTrack(currentTrackIndex);

    if (isPlaying) {
        audioEngine.play().catch(() => {});
        setPixelState("playing");
    }
}

// ==========================================
// 📀 AUTO NEXT
// ==========================================

audioEngine.addEventListener("ended", () => {
    changeTrack("next");
});

// ==========================================
// 📜 PLAYLIST
// ==========================================

function renderPlaylist() {
    if (!playlistContainer) return;

    playlistContainer.innerHTML = "";

    trackList.forEach((track, index) => {
        const li = document.createElement("li");
        li.classList.add("track-item");

        if (index === currentTrackIndex) li.classList.add("active");

        li.innerHTML = `
            <div><strong>${track.title}</strong> - ${track.artist}</div>
            <span class="note">💜</span>
        `;

        li.addEventListener("click", () => {
            loadTrack(index);
            isPlaying = true;
            audioEngine.play().catch(() => {});
            setPixelState("playing");
            setPlayButtonIcon(true);
        });

        playlistContainer.appendChild(li);
    });
}

// ==========================================
// 🔄 UI UPDATE
// ==========================================

function updatePlaylistUI() {
    if (!playlistContainer) return;

    const items = playlistContainer.querySelectorAll(".track-item");

    items.forEach((item, i) => {
        const isActive = i === currentTrackIndex;
        item.classList.toggle("active", isActive);
        if (isActive) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    });
}

// ==========================================
// 🎮 EVENTS
// ==========================================

playBtn?.addEventListener("click", togglePlay);
nextBtn?.addEventListener("click", () => changeTrack("next"));
prevBtn?.addEventListener("click", () => changeTrack("prev"));

// ==========================================
// 🚀 INIT
// ==========================================

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM loaded");
    
    if (!canvas || !ctx) {
        console.error("❌ Canvas not found!");
        return;
    }
    
    // Draw test
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(0, 0, 96, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💜', 48, 48);
    
    loadAllSprites.then(() => {
        console.log('✅ All sprites loaded!');
        renderPlaylist();
        loadTrack(currentTrackIndex);
    }).catch(() => {
        renderPlaylist();
        loadTrack(currentTrackIndex);
    });
});

// Fallback
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM already loaded, trigger init
    setTimeout(() => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
    }, 100);
}