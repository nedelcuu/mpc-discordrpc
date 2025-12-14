const log = require('fancy-log'),
    jsdom = require('jsdom'),
    { 
        ignoreBrackets, 
        ignoreFiletype, 
        replaceUnderscore, 
        showRemainingTime,  
        replaceDots,
        port,
    } = require('./config'),
    { JSDOM } = jsdom;

// Discord Rich Presence has a string length limit of 128 characters.
// This utility function helps by trimming strings up to a given length.
const trimStr = (str, length) => {
    return str.length > length ? str.substring(0, length - 3) + "..." : str;
};

// Defines playback data fetched from MPC.
let playback = {
    filename: '',
    position: '',
    duration: '',
    fileSize: '',
    state: '',
    prevState: '',
    prevPosition: '',
};

// Defines strings and image keys according to the 'state' string
// provided by MPC.
const states = {
    '-1': {
        string: 'Idling',
        stateKey: 'stop_small'
    },
    '0': {
        string: 'Stopped',
        stateKey: 'stop_small'
    },
    '1': {
        string: 'Paused',
        stateKey: 'pause_small'
    },
    '2': {
        string: 'Playing',
        stateKey: 'play_small'
    }
};

/**
 * Sends Rich Presence updates to Discord client.
 * @param {AxiosResponse} res Response from MPC Web Interface variables page
 * @param {RPCClient} rpc Discord Client RPC connection instance
 */
const updatePresence = (res, rpc) => {
    // Identifies which MPC fork is running.
    const mpcFork = res.headers.server.replace(' WebServer', '');

    // Gets a DOM object based on MPC Web Interface variables page.
    const { document } = new JSDOM(res.data).window;

    // Gets relevant info from the DOM object.
    let filename = playback.filename = trimStr(document.getElementById('filepath').textContent.split("\\").pop(), 128);
    playback.state = document.getElementById('state').textContent;
    playback.duration = sanitizeTime(document.getElementById('durationstring').textContent);
    playback.position = sanitizeTime(document.getElementById('positionstring').textContent);
    
    // Get additional info if available
    const durationMs = convert(document.getElementById('durationstring').textContent);
    const positionMs = convert(document.getElementById('positionstring').textContent);
    const progressPercent = durationMs > 0 ? Math.round((positionMs / durationMs) * 100) : 0;
    const remainingMs = durationMs - positionMs;
    const remainingTime = remainingMs > 0 ? formatTime(remainingMs) : '00:00';

    // Replaces underscore characters to space characters
    if (replaceUnderscore) playback.filename = playback.filename.replace(/_/g, " ");

	// Removes brackets and its content from filename if `ignoreBrackets` option
	// is set to true
    if (ignoreBrackets) {
        playback.filename = trimStr(playback.filename.replace(/ *\[[^\]]*\]/g, ""), 128);
        if (playback.filename.substring(0, playback.filename.lastIndexOf(".")).length == 0) playback.filename = filename;
    }
	
    // Replaces dots in filenames to space characters
    // Solution found at https://stackoverflow.com/a/28673744
    if (replaceDots) {
        playback.filename = playback.filename.replace(/[.](?=.*[.])/g, " ");
    }

	// Removes filetype from displaying
	if (ignoreFiletype) playback.filename = playback.filename.substring(0, playback.filename.lastIndexOf("."));

    // Prepares playback data for Discord Rich Presence with modern 2025 features.
    let payload = {
        state: undefined,
        startTimestamp: undefined,
        endTimestamp: undefined,
        details: playback.filename,
        largeImageKey: mpcFork === 'MPC-BE' ? 'mpcbe_logo' : 'default',
        largeImageText: playback.state !== '-1' ? `${mpcFork} • ${playback.duration}` : mpcFork,
        smallImageKey: states[playback.state].stateKey,
        smallImageText: states[playback.state].string,
        // Modern Discord features (2025)
        buttons: [],
        party: undefined,
        partySize: undefined
    };
    
    // Add modern buttons for media playback (if playing/paused)
    // Discord Rich Presence buttons (2025 feature)
    if (playback.state === '2' || playback.state === '1') {
        payload.buttons = [
            {
                label: '🎬 Open MPC Web Interface',
                url: `http://127.0.0.1:${port}/`
            }
        ];
    }
    
    // Add party information for playback progress (modern 2025 feature)
    // Shows progress as party size (e.g., "45/100" = 45% complete)
    if (playback.state === '2' && durationMs > 0) {
        payload.party = {
            size: [progressPercent, 100],
            id: 'mpc-playback-' + Date.now()
        };
    }

    // Makes changes to payload data according to playback state.
    switch (playback.state) {
        case '-1': // Idling
            payload.state = 'No media loaded';
            payload.details = undefined;
            payload.largeImageText = mpcFork;
            break;
        case '0': // Stopped
            payload.state = `⏹️ ${playback.duration} total`;
            break;
        case '1': // Paused
            payload.state = `⏸️ ${playback.position} / ${playback.duration} • ${progressPercent}%`;
            break;
        case '2': // Playing
            if (showRemainingTime) {
                payload.state = `▶️ ${remainingTime} left • ${progressPercent}%`;
                payload.endTimestamp = Date.now() + remainingMs;
            } else {
                // Modern format with emoji and better layout
                payload.state = `▶️ ${playback.position} / ${playback.duration} • ${progressPercent}%`;
                payload.startTimestamp = Date.now() - positionMs;
            }
            break;
    }

    // Modern 2025 approach: Real-time updates every second for truly live experience
    // Update on state change, or every second while playing for live progress
    const prevPositionMs = playback.prevPosition ? convert(playback.prevPosition) : 0;
    const currentPositionMs = convert(playback.position);
    const positionDelta = Math.abs(currentPositionMs - prevPositionMs);
    
    const shouldUpdate = (playback.state !== playback.prevState) || 
        (playback.state === '2' && positionDelta >= 800) || // Update every ~1s while playing (800ms threshold for smooth updates)
        (playback.state === '1' && positionDelta >= 500) || // Update when paused if position changes
        (playback.state !== '2' && playback.state !== '-1' && playback.state === playback.prevState);
    
    if (shouldUpdate) {
        // Clean up payload: remove undefined values for better compatibility
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== undefined)
        );
        
        // Remove empty arrays/objects
        if (cleanPayload.buttons && cleanPayload.buttons.length === 0) {
            delete cleanPayload.buttons;
        }
        if (cleanPayload.party && !cleanPayload.party.size) {
            delete cleanPayload.party;
        }
        
        // @xhayper/discord-rpc uses user.setActivity() instead of setActivity()
        if (rpc.user) {
            rpc.user.setActivity(cleanPayload)
                .catch((err) => {
                    log.error('ERROR: ' + err);
                });
        } else {
            // Fallback for compatibility
            if (typeof rpc.setActivity === 'function') {
                rpc.setActivity(cleanPayload)
                    .catch((err) => {
                        log.error('ERROR: ' + err);
                    });
            }
        }
        const stateInfo = playback.state === '2' && showRemainingTime 
            ? `${remainingTime} remaining`
            : `${playback.position} / ${playback.duration} (${progressPercent}%)`;
        log.info('INFO: Presence update sent: ' +
            `${states[playback.state].string} - ${stateInfo} - ${playback.filename}`
        );
    }

    // Replaces previous playback state and position for later comparison.
    playback.prevState = playback.state;
    playback.prevPosition = playback.position;
    return true;
};

/**
 * Simple and quick utility to convert time from 'hh:mm:ss' format to milliseconds.
 * @param {string} time Time string formatted as 'hh:mm:ss'
 * @returns {number} Number of milliseconds converted from the given time string
 */
const convert = time => {
    let parts = time.split(':'),
        seconds = parseInt(parts[parts.length - 1]),
        minutes = parseInt(parts[parts.length - 2]),
        hours = (parts.length > 2) ? parseInt(parts[0]) : 0;
    return ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
};

/**
 * In case the given 'hh:mm:ss' formatted time string is less than 1 hour, 
 * removes the '00' hours from it.
 * @param {string} time Time string formatted as 'hh:mm:ss'
 * @returns {string} Time string without '00' hours
 */
const sanitizeTime = time => {
    if (time.split(':')[0] === '00') {
        return time.substring(3);
    }
    return time;
};

/**
 * Formats milliseconds to 'mm:ss' or 'hh:mm:ss' format.
 * @param {number} ms Milliseconds to format
 * @returns {string} Formatted time string
 */
const formatTime = ms => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

module.exports = updatePresence;
