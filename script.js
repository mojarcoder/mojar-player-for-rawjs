document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const video = document.getElementById('myVideo');
    const mediaContainer = document.getElementById('mediaContainer');
    const playPauseBtn = document.getElementById('videoPlayPause');
    const stopBtn = document.getElementById('videoStop');
    const seekBar = document.getElementById('videoSeek');
    const seekPreview = document.getElementById('seekPreview');
    const currentTimeDisplay = document.getElementById('videoCurrentTime');
    const durationDisplay = document.getElementById('videoDuration');
    const muteBtn = document.getElementById('videoMute');
    const volumeBar = document.getElementById('videoVolume');
    const speedSelect = document.getElementById('videoSpeed');
    const fullscreenBtn = document.getElementById('videoFullscreen');
    const mediaTitle = document.getElementById('mediaTitle');
    const openFileBtn = document.getElementById('openFileBtn');
    const mediaFileInput = document.getElementById('mediaFileInput');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
    const playlist = document.getElementById('playlist');
    const playlistCount = document.getElementById('playlistCount');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const loopBtn = document.getElementById('loopBtn');
    const captionBtn = document.getElementById('captionBtn');
    const snapBtn = document.getElementById('snapBtn');
    const openUrlBtn = document.getElementById('openUrlBtn');
    const urlDialog = document.getElementById('urlDialog');
    const closeUrlDialog = document.getElementById('closeUrlDialog');
    const urlInput = document.getElementById('urlInput');
    const loadUrlBtn = document.getElementById('loadUrlBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const contextMenu = document.querySelector('.context-menu');
    const propertiesDialog = document.getElementById('propertiesDialog');
    const closePropertiesDialog = document.getElementById('closePropertiesDialog');
    const propertiesContainer = document.querySelector('.properties-container');
    const splashScreen = document.getElementById('splashScreen');
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutScreen = document.getElementById('aboutScreen');
    const closeAboutDialog = document.getElementById('closeAboutDialog');
    
    // Ensure player is fully initialized when splash screen hides
    function ensurePlayerInitialized() {
        // Make sure UI elements are visible and responsive
        if (mediaContainer) {
            mediaContainer.style.visibility = 'visible';
            mediaContainer.style.opacity = '1';
        }
        // Update controls initial state
        updateMuteButton();
        handleVolume();
        handleSpeedChange();
        updatePlaylistUI();
        updatePlaylistCount();
    }
    
    // --- Splash Screen Logic ---
    function hideSplashScreen() {
        // Add both hide classes to fully remove the splash screen
        splashScreen.classList.add('hide');
        splashScreen.classList.add('force-hide');
        
        // Make sure player elements are visible and initialized
        document.querySelector('.player-container').style.visibility = 'visible';
        document.querySelector('.player-container').style.opacity = '1';
        document.querySelector('.player-container').style.zIndex = '1';
        
        // Update controls initial state
        updateMuteButton();
        handleVolume();
        handleSpeedChange();
        updatePlaylistUI();
        updatePlaylistCount();
    }
    
    // Show splash screen for a shorter time (1 second) then fade out
    setTimeout(hideSplashScreen, 1000);
    
    // Add a backup solution - allow clicking on splash screen to dismiss it
    splashScreen.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent body click handler from being triggered twice
        hideSplashScreen();
    });
    
    // --- About Dialog Functions ---
    function openAboutDialog() {
        aboutScreen.classList.add('active');
    }
    
    // --- State Variables ---
    let isVideoPlaying = false;
    let wasPlayingBeforeSeek = false;
    let lastVolume = 1;
    let hideControlsTimeout;
    let currentPlaylistIndex = -1;
    let playlistItems = [];
    let isShuffleActive = false;
    let isLoopActive = false;
    let isCaptionActive = false;
    let availableCaptions = [];
    let currentTheme = 'dark'; // Default theme
    
    // --- Helper Functions ---
    function formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
        
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }
    
    function toggleControlsVisibility(show) {
        const controls = document.querySelector('.overlay-controls');
        if (show) {
            controls.style.opacity = '1';
            clearTimeout(hideControlsTimeout);
            
            // Set timer to hide controls after 3 seconds of inactivity
            if (isVideoPlaying) {
                hideControlsTimeout = setTimeout(() => {
                    controls.style.opacity = '0';
                }, 3000);
            }
        } else {
            controls.style.opacity = '0';
        }
    }
    
    function getFileNameFromPath(path) {
        // For files selected by input, we can get the name directly
        if (path instanceof File) return path.name;
        
        // For URLs, extract filename
        return path.split('/').pop().split('?')[0];
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // --- Theme Functions ---
    function loadSavedTheme() {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('mediaPlayerTheme');
        if (savedTheme) {
            currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', currentTheme);
            
            // Update icon
            themeToggleBtn.innerHTML = currentTheme === 'dark' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
        }
    }

    function toggleTheme() {
        // Toggle between light and dark mode
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update data attribute on document element
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Update theme toggle button icon
        themeToggleBtn.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
        
        // Save preference to localStorage
        localStorage.setItem('mediaPlayerTheme', currentTheme);
        
        showNotification(`${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} theme activated`);
    }
    
    // --- Dialog Functions ---
    function openUrlDialogWindow() {
        urlDialog.classList.add('active');
        setTimeout(() => {
            urlInput.focus();
        }, 300);
    }
    
    function closeUrlDialogWindow() {
        urlDialog.classList.remove('active');
    }
    
    function loadFromUrl() {
        const url = urlInput.value.trim();
        if (!url) {
            showNotification('Please enter a valid URL', 'error');
            return;
        }
        
        if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://'))) {
            showNotification('URL must start with http://, https://, or file://', 'error');
            return;
        }
        
        // Get filename from URL for playlist
        const filename = getFileNameFromPath(url);
        
        // Load the URL
        loadMediaFile(url, filename);
        addToPlaylist(url, filename);
        
        // Explicitly save to localStorage
        const saved = savePlaylistToStorage();
        if (saved) {
            console.log('Playlist saved after adding URL:', url);
        }
        
        // Close dialog and reset input
        closeUrlDialogWindow();
        urlInput.value = '';
        
        showNotification(`Loading media from URL: ${filename}`);
    }
    
    // --- Media Control Functions ---
    function togglePlay() {
        if (video.paused || video.ended) {
            video.play().then(() => {
                isVideoPlaying = true;
                updatePlayButton();
                showNotification('Playing');
            }).catch(error => {
                console.error("Error playing video:", error);
                showNotification('Error playing media', 'error');
            });
        } else {
            video.pause();
            isVideoPlaying = false;
            updatePlayButton();
            showNotification('Paused');
        }
    }
    
    function updatePlayButton() {
        const icon = playPauseBtn.querySelector('i');
        if (video.paused || video.ended) {
            icon.className = 'fas fa-play';
        } else {
            icon.className = 'fas fa-pause';
        }
    }
    
    function stopVideo() {
        video.pause();
        video.currentTime = 0;
        isVideoPlaying = false;
        updatePlayButton();
        showNotification('Stopped');
    }
    
    function handleSeekMouseDown() {
        if (!video.paused) {
            wasPlayingBeforeSeek = true;
            video.pause();
        }
    }
    
    function handleSeekInput() {
        const newTime = video.duration * (seekBar.value / 100);
        if (!isNaN(newTime) && isFinite(newTime)) {
            video.currentTime = newTime;
        }
        
        if (wasPlayingBeforeSeek) {
            // Small timeout to ensure seek completes
            setTimeout(() => {
                video.play();
                isVideoPlaying = true;
            }, 50);
            wasPlayingBeforeSeek = false;
        }
    }
    
    function updateProgress() {
        if (video.duration > 0 && isFinite(video.duration)) {
            const percentage = (video.currentTime / video.duration) * 100;
            seekBar.value = percentage;
            currentTimeDisplay.textContent = formatTime(video.currentTime);
        } else {
            seekBar.value = 0;
            currentTimeDisplay.textContent = formatTime(0);
        }
    }
    
    function showSeekPreview(event) {
        // Only show preview if we have loaded video
        if (!video.duration || !isFinite(video.duration)) return;
        
        const rect = seekBar.getBoundingClientRect();
        const position = (event.clientX - rect.left) / rect.width;
        const previewTime = position * video.duration;
        
        // Set preview position
        seekPreview.style.left = `${event.clientX}px`;
        seekPreview.style.display = 'block';
        
        // If we had video frames, we would set them here
        // For now, just show the time
        seekPreview.textContent = formatTime(previewTime);
    }
    
    function hideSeekPreview() {
        seekPreview.style.display = 'none';
    }
    
    function updateDuration() {
        if (video.duration > 0 && isFinite(video.duration)) {
            durationDisplay.textContent = formatTime(video.duration);
        } else {
            durationDisplay.textContent = formatTime(0);
        }
    }
    
    function handleVolume() {
        video.volume = volumeBar.value;
        video.muted = video.volume === 0;
        updateMuteButton();
    }
    
    function toggleMute() {
        video.muted = !video.muted;
        
        if (video.muted) {
            lastVolume = video.volume;
            volumeBar.value = 0;
        } else {
            volumeBar.value = lastVolume > 0 ? lastVolume : 1;
            video.volume = volumeBar.value;
        }
        
        updateMuteButton();
        showNotification(video.muted ? 'Muted' : 'Unmuted');
    }
    
    function updateMuteButton() {
        const icon = muteBtn.querySelector('i');
        
        if (video.muted || video.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (video.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    function handleSpeedChange() {
        video.playbackRate = parseFloat(speedSelect.value);
        showNotification(`Playback speed: ${speedSelect.value}x`);
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (mediaContainer.requestFullscreen) {
                mediaContainer.requestFullscreen();
            } else if (mediaContainer.webkitRequestFullscreen) {
                mediaContainer.webkitRequestFullscreen();
            } else if (mediaContainer.msRequestFullscreen) {
                mediaContainer.msRequestFullscreen();
            }
            showNotification('Fullscreen mode');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            showNotification('Exit fullscreen');
        }
    }
    
    function seek(seconds) {
        const newTime = video.currentTime + seconds;
        if (newTime < 0) {
            video.currentTime = 0;
        } else if (newTime > video.duration) {
            video.currentTime = video.duration;
        } else {
            video.currentTime = newTime;
        }
        
        showNotification(`${seconds > 0 ? '+' : ''}${seconds}s`);
    }
    
    function changeVolume(amount) {
        let newVolume = parseFloat(video.volume) + amount;
        newVolume = Math.max(0, Math.min(1, newVolume));
        video.volume = newVolume;
        volumeBar.value = newVolume;
        video.muted = newVolume === 0;
        updateMuteButton();
        
        // Show volume notification
        const volumePercent = Math.round(newVolume * 100);
        showNotification(`Volume: ${volumePercent}%`);
    }
    
    function toggleCaptions() {
        isCaptionActive = !isCaptionActive;
        
        // Get available text tracks
        if (video.textTracks.length > 0) {
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = isCaptionActive ? 'showing' : 'hidden';
            }
            
            captionBtn.classList.toggle('active', isCaptionActive);
            showNotification(isCaptionActive ? 'Captions enabled' : 'Captions disabled');
        } else {
            showNotification('No captions available', 'warning');
        }
    }
    
    function takeSnapshot() {
        if (!video.videoWidth) {
            showNotification('No video loaded', 'error');
            return;
        }
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
            // Convert canvas to image data URL
            const imageUrl = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `snapshot_${new Date().getTime()}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Snapshot saved');
        } catch (error) {
            console.error('Error taking snapshot:', error);
            showNotification('Error taking snapshot', 'error');
        }
    }
    
    // --- File Handling Functions ---
    function openFileDialog() {
        mediaFileInput.click();
    }
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Create object URL for the file
        const fileURL = URL.createObjectURL(file);
        
        // Check file type to determine video vs audio
        if (file.type.startsWith('video/')) {
            loadMediaFile(fileURL, file.name, 'video');
        } else if (file.type.startsWith('audio/')) {
            loadMediaFile(fileURL, file.name, 'audio');
        } else {
            showNotification('Unsupported file type', 'error');
            return;
        }
        
        // Add to playlist
        addToPlaylist(fileURL, file.name);
        
        // Explicitly force save to localStorage
        const saved = savePlaylistToStorage();
        if (saved) {
            console.log('Playlist saved after adding file:', file.name);
        }
        
        showNotification(`Loaded: ${file.name}`);
    }
    
    function loadMediaFile(source, name, type = 'video') {
        // Set video source
        video.src = source;
        video.load();
        
        // Update UI
        mediaTitle.textContent = name || getFileNameFromPath(source);
        
        // Reset player state
        seekBar.value = 0;
        currentTimeDisplay.textContent = formatTime(0);
        
        // Auto-play loaded media
        video.play().then(() => {
            isVideoPlaying = true;
            updatePlayButton();
        }).catch(err => {
            console.error("Error playing media:", err);
            showNotification('Error playing media', 'error');
        });
    }
    
    // --- Playlist Functions ---
    function addToPlaylist(source, name) {
        // Add to playlist array
        const mediaItem = { source, name };
        playlistItems.push(mediaItem);
        
        // Update playlist UI
        updatePlaylistUI();
        
        // Set current index if first item
        if (playlistItems.length === 1) {
            currentPlaylistIndex = 0;
            updateActivePlaylistItem();
        }
        
        // Update playlist count
        updatePlaylistCount();
        
        // Save playlist to localStorage
        savePlaylistToStorage();
    }
    
    // Function to save playlist to localStorage
    function savePlaylistToStorage() {
        try {
            // Only save http/https URLs
            const storablePlaylist = playlistItems.filter(item => {
                return item.source.startsWith('http:') || item.source.startsWith('https:');
            });
            
            // Store the playlist if it has any items
            if (storablePlaylist.length > 0) {
                const playlistStr = JSON.stringify(storablePlaylist);
                console.log('SAVING PLAYLIST:', playlistStr);
                localStorage.setItem('mojarPlayerPlaylist', playlistStr);
                return true;
            } else {
                localStorage.removeItem('mojarPlayerPlaylist');
                return false;
            }
        } catch (error) {
            console.error('Error saving playlist:', error);
            return false;
        }
    }
    
    // Function to load playlist from localStorage
    function loadPlaylistFromStorage() {
        try {
            const savedPlaylist = localStorage.getItem('mojarPlayerPlaylist');
            console.log('LOADING PLAYLIST:', savedPlaylist);
            
            if (!savedPlaylist) {
                return false;
            }
            
            const items = JSON.parse(savedPlaylist);
            
            if (!Array.isArray(items) || items.length === 0) {
                return false;
            }
            
            // Load items into playlist
            playlistItems = items;
            updatePlaylistUI();
            updatePlaylistCount();
            
            // Set current index
            currentPlaylistIndex = 0;
            updateActivePlaylistItem();
            
            // Load the first item
            const firstItem = playlistItems[0];
            if (firstItem && firstItem.source) {
                loadMediaFile(firstItem.source, firstItem.name);
            }
            
            return true;
        } catch (error) {
            console.error('Error loading playlist:', error);
            return false;
        }
    }
    
    function updatePlaylistCount() {
        playlistCount.textContent = `${playlistItems.length} item${playlistItems.length !== 1 ? 's' : ''}`;
    }
    
    function updatePlaylistUI() {
        // Clear the playlist UI
        playlist.innerHTML = '';
        
        if (playlistItems.length === 0) {
            playlist.innerHTML = '<li class="playlist-item empty-playlist">No media added to playlist</li>';
            return;
        }
        
        // Add each item to the playlist
        playlistItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === currentPlaylistIndex) {
                li.classList.add('active');
            }
            
            li.textContent = item.name || getFileNameFromPath(item.source);
            li.addEventListener('click', () => playFromPlaylist(index));
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.className = 'playlist-delete-btn';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromPlaylist(index);
            });
            
            li.appendChild(deleteBtn);
            playlist.appendChild(li);
        });
    }
    
    function playFromPlaylist(index) {
        if (index >= 0 && index < playlistItems.length) {
            currentPlaylistIndex = index;
            const item = playlistItems[index];
            
            // Check if URL is valid before loading
            if (item.source && (item.source.startsWith('http:') || 
                              item.source.startsWith('https:') || 
                              item.source.startsWith('file:') || 
                              item.source.startsWith('blob:'))) {
                
                loadMediaFile(item.source, item.name);
                updateActivePlaylistItem();
                
                // Save current state to localStorage
                savePlaylistToStorage();
                return true;
            } else {
                console.error('Invalid URL in playlist:', item.source);
                showNotification('Error: Cannot load invalid URL', 'error');
                return false;
            }
        }
        return false;
    }
    
    function updateActivePlaylistItem() {
        const items = playlist.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === currentPlaylistIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    function removeFromPlaylist(index) {
        playlistItems.splice(index, 1);
        
        // Adjust current index if needed
        if (currentPlaylistIndex === index) {
            // Play next item or reset player if no items left
            if (playlistItems.length > 0) {
                currentPlaylistIndex = Math.min(index, playlistItems.length - 1);
                playFromPlaylist(currentPlaylistIndex);
            } else {
                currentPlaylistIndex = -1;
                // Reset player
                video.src = '';
                mediaTitle.textContent = 'No Media Loaded';
            }
        } else if (currentPlaylistIndex > index) {
            // Adjust current index if deleted item was before current
            currentPlaylistIndex--;
        }
        
        updatePlaylistUI();
        updatePlaylistCount();
        
        // Save updated playlist to localStorage
        savePlaylistToStorage();
    }
    
    function clearPlaylist() {
        playlistItems = [];
        currentPlaylistIndex = -1;
        
        // Reset player
        video.src = '';
        mediaTitle.textContent = 'No Media Loaded';
        
        updatePlaylistUI();
        updatePlaylistCount();
        
        // Remove playlist from localStorage
        localStorage.removeItem('mojarPlayerPlaylist');
        showNotification('Playlist cleared');
    }
    
    function toggleShuffle() {
        isShuffleActive = !isShuffleActive;
        shuffleBtn.classList.toggle('active', isShuffleActive);
        showNotification(isShuffleActive ? 'Shuffle on' : 'Shuffle off');
    }
    
    function toggleLoop() {
        isLoopActive = !isLoopActive;
        loopBtn.classList.toggle('active', isLoopActive);
        video.loop = isLoopActive;
        showNotification(isLoopActive ? 'Loop on' : 'Loop off');
    }
    
    function playNextInPlaylist() {
        if (playlistItems.length <= 1) return;
        
        let nextIndex;
        
        if (isShuffleActive) {
            // Random index different from current
            do {
                nextIndex = Math.floor(Math.random() * playlistItems.length);
            } while (nextIndex === currentPlaylistIndex && playlistItems.length > 1);
        } else {
            // Sequential next
            nextIndex = currentPlaylistIndex + 1;
            if (nextIndex >= playlistItems.length) {
                nextIndex = 0; // Loop back to beginning
            }
        }
        
        playFromPlaylist(nextIndex);
        showNotification('Playing next item');
    }
    
    function playPreviousInPlaylist() {
        if (playlistItems.length <= 1) return;
        
        let prevIndex;
        
        if (isShuffleActive) {
            // Random index different from current
            do {
                prevIndex = Math.floor(Math.random() * playlistItems.length);
            } while (prevIndex === currentPlaylistIndex && playlistItems.length > 1);
        } else {
            // Sequential previous
            prevIndex = currentPlaylistIndex - 1;
            if (prevIndex < 0) {
                prevIndex = playlistItems.length - 1; // Loop to end
            }
        }
        
        playFromPlaylist(prevIndex);
        showNotification('Playing previous item');
    }
    
    // --- Context Menu Functions ---
    function showContextMenu(e) {
        e.preventDefault();
        
        // Position the menu
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        
        // Show the menu
        contextMenu.style.display = 'block';
        
        // Adjust position if menu goes off screen
        const menuRect = contextMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (menuRect.right > viewportWidth) {
            contextMenu.style.left = `${e.pageX - menuRect.width}px`;
        }
        
        if (menuRect.bottom > viewportHeight) {
            contextMenu.style.top = `${e.pageY - menuRect.height}px`;
        }
        
        // Add click event to document to close menu when clicking outside
        document.addEventListener('click', closeContextMenuOnClickOutside);
    }
    
    function closeContextMenu() {
        contextMenu.style.display = 'none';
        document.removeEventListener('click', closeContextMenuOnClickOutside);
    }
    
    function closeContextMenuOnClickOutside(e) {
        if (!contextMenu.contains(e.target)) {
            closeContextMenu();
        }
    }
    
    function handleContextMenuAction(action) {
        closeContextMenu();
        
        switch (action) {
            case 'play':
                togglePlay();
                break;
            case 'stop':
                stopVideo();
                break;
            case 'mute':
                toggleMute();
                break;
            case 'fullscreen':
                toggleFullscreen();
                break;
            case 'snapshot':
                takeSnapshot();
                break;
            case 'copy-time':
                copyCurrentTime();
                break;
            case 'loop':
                toggleLoop();
                break;
            case 'properties':
                showPropertiesDialog();
                break;
            case 'speed-0.5':
                speedSelect.value = '0.5';
                handleSpeedChange();
                break;
            case 'speed-1':
                speedSelect.value = '1';
                handleSpeedChange();
                break;
            case 'speed-1.5':
                speedSelect.value = '1.5';
                handleSpeedChange();
                break;
            case 'speed-2':
                speedSelect.value = '2';
                handleSpeedChange();
                break;
        }
    }
    
    function showPropertiesDialog() {
        if (!video.src) {
            showNotification('No media loaded');
            return;
        }
        
        // Clear previous content
        propertiesContainer.innerHTML = '';
        
        // Get media properties
        const properties = [
            ['File name', mediaTitle.textContent || 'Unknown'],
            ['Duration', video.duration ? formatTime(video.duration) : 'Unknown'],
            ['Current time', formatTime(video.currentTime)],
            ['Video size', `${video.videoWidth} x ${video.videoHeight}`],
            ['Volume', `${Math.round(video.volume * 100)}%`],
            ['Playback rate', `${video.playbackRate}x`],
            ['Source', video.currentSrc || 'Unknown']
        ];
        
        // Populate properties
        properties.forEach(([name, value]) => {
            const nameElement = document.createElement('div');
            nameElement.textContent = name;
            
            const valueElement = document.createElement('div');
            valueElement.textContent = value;
            
            propertiesContainer.appendChild(nameElement);
            propertiesContainer.appendChild(valueElement);
        });
        
        // Show dialog
        propertiesDialog.classList.add('active');
    }
    
    function copyCurrentTime() {
        if (!video.src) {
            showNotification('No media loaded');
            return;
        }
        
        const currentTime = formatTime(video.currentTime);
        navigator.clipboard.writeText(currentTime)
            .then(() => {
                showNotification(`Time ${currentTime} copied to clipboard`);
            })
            .catch(() => {
                showNotification('Failed to copy time');
            });
    }
    
    // --- Keyboard Shortcuts ---
    function handleKeyboardShortcuts(e) {
        // Don't handle keyboard shortcuts if focus is on certain form elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case ' ': // Space - toggle play/pause
                e.preventDefault();
                togglePlay();
                break;
            case 'f': // F - fullscreen
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm': // M - mute
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
            case 'ArrowRight': // Right arrow - seek forward
                e.preventDefault();
                seek(10); // 10 seconds forward
                break;
            case 'ArrowLeft': // Left arrow - seek backward
                e.preventDefault();
                seek(-10); // 10 seconds backward
                break;
            case 'ArrowUp': // Up arrow - volume up
                e.preventDefault();
                changeVolume(0.05); // 5% volume up
                break;
            case 'ArrowDown': // Down arrow - volume down
                e.preventDefault();
                changeVolume(-0.05); // 5% volume down
                break;
            case 'n': // N - next track
            case 'N':
                e.preventDefault();
                playNextInPlaylist();
                break;
            case 'p': // P - previous track
            case 'P':
                e.preventDefault();
                playPreviousInPlaylist();
                break;
            case 's': // S - stop video
            case 'S':
                e.preventDefault();
                stopVideo();
                break;
            case 'c': // C - toggle captions
            case 'C':
                e.preventDefault();
                toggleCaptions();
                break;
            case 'l': // L - toggle loop
            case 'L':
                e.preventDefault();
                toggleLoop();
                break;
            case 'r': // R - toggle shuffle (random)
            case 'R':
                e.preventDefault();
                toggleShuffle();
                break;
            case 't': // T - toggle theme
            case 'T':
                e.preventDefault();
                toggleTheme();
                break;
        }
    }
    
    // --- CSS Styles for Notifications ---
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            text-align: center;
            backdrop-filter: blur(5px);
            border-left: 3px solid var(--accent-color);
        }
        
        .notification.error {
            border-left-color: #ff4444;
            background-color: rgba(255, 0, 0, 0.2);
        }
        
        .notification.warning {
            border-left-color: #ffbb33;
            background-color: rgba(255, 187, 51, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // --- Event Listeners ---
    // Video events
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
        updateDuration();
        updateProgress();
        
        // Check for caption tracks
        if (video.textTracks.length > 0) {
            captionBtn.style.display = 'flex';
        } else {
            captionBtn.style.display = 'none';
        }
        
        // Save playlist whenever a new video loads
        savePlaylistToStorage();
    });
    video.addEventListener('play', () => {
        isVideoPlaying = true;
        updatePlayButton();
    });
    video.addEventListener('pause', () => {
        isVideoPlaying = false;
        updatePlayButton();
    });
    video.addEventListener('ended', () => {
        isVideoPlaying = false;
        updatePlayButton();
        
        // Auto advance to next in playlist if not looped
        if (!isLoopActive) {
            playNextInPlaylist();
        }
    });
    video.addEventListener('volumechange', updateMuteButton);
    
    // Control interactions
    playPauseBtn.addEventListener('click', togglePlay);
    stopBtn.addEventListener('click', stopVideo);
    seekBar.addEventListener('mousedown', handleSeekMouseDown);
    seekBar.addEventListener('input', handleSeekInput);
    seekBar.addEventListener('mousemove', showSeekPreview);
    seekBar.addEventListener('mouseout', hideSeekPreview);
    muteBtn.addEventListener('click', toggleMute);
    volumeBar.addEventListener('input', handleVolume);
    speedSelect.addEventListener('change', handleSpeedChange);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    rewindBtn.addEventListener('click', () => seek(-10));
    forwardBtn.addEventListener('click', () => seek(10));
    previousBtn.addEventListener('click', playPreviousInPlaylist);
    nextBtn.addEventListener('click', playNextInPlaylist);
    shuffleBtn.addEventListener('click', toggleShuffle);
    loopBtn.addEventListener('click', toggleLoop);
    captionBtn.addEventListener('click', toggleCaptions);
    snapBtn.addEventListener('click', takeSnapshot);
    
    // File and playlist handling
    openFileBtn.addEventListener('click', openFileDialog);
    mediaFileInput.addEventListener('change', handleFileSelect);
    clearPlaylistBtn.addEventListener('click', clearPlaylist);
    
    // URL Dialog
    openUrlBtn.addEventListener('click', openUrlDialogWindow);
    closeUrlDialog.addEventListener('click', closeUrlDialogWindow);
    loadUrlBtn.addEventListener('click', loadFromUrl);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loadFromUrl();
        } else if (e.key === 'Escape') {
            closeUrlDialogWindow();
        }
    });
    
    // About Dialog
    aboutBtn.addEventListener('click', openAboutDialog);
    closeAboutDialog.addEventListener('click', () => {
        aboutScreen.classList.remove('active');
    });
    
    // Close dialog when clicking outside
    urlDialog.addEventListener('click', (e) => {
        if (e.target === urlDialog) {
            closeUrlDialogWindow();
        }
    });
    
    aboutScreen.addEventListener('click', (e) => {
        if (e.target === aboutScreen) {
            closeAboutDialog();
        }
    });
    
    // Overlay controls visibility
    mediaContainer.addEventListener('mousemove', () => toggleControlsVisibility(true));
    mediaContainer.addEventListener('mouseleave', () => {
        if (isVideoPlaying) {
            toggleControlsVisibility(false);
        }
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click on video to play/pause
    video.addEventListener('click', togglePlay);
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Context menu
    mediaContainer.addEventListener('contextmenu', showContextMenu);
    
    // Context menu item clicks
    document.querySelectorAll('.context-menu-item').forEach(item => {
        const action = item.getAttribute('id')?.replace('context', '').toLowerCase();
        const dataSpeed = item.getAttribute('data-speed');
        
        if (action) {
            item.setAttribute('data-action', action);
        } else if (dataSpeed) {
            item.setAttribute('data-action', `speed-${dataSpeed}`);
        }
        
        item.addEventListener('click', function() {
            const actionToPerform = this.getAttribute('data-action');
            if (actionToPerform) {
                handleContextMenuAction(actionToPerform);
            }
        });
    });
    
    // Properties dialog
    closePropertiesDialog.addEventListener('click', () => {
        propertiesDialog.classList.remove('active');
    });
    
    // Prevent default context menu on rest of the page
    document.addEventListener('contextmenu', function(e) {
        if (!mediaContainer.contains(e.target)) {
            e.preventDefault();
        }
    });
    
    // Escape key to exit dialogs and context menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open dialogs
            document.querySelectorAll('.dialog').forEach(dialog => {
                dialog.classList.remove('active');
            });
            urlDialog.classList.remove('active');
            aboutScreen.classList.remove('active');
            
            // Close context menu
            closeContextMenu();
        }
    });
    
    // Initial state setup
    updateMuteButton();
    handleVolume();
    handleSpeedChange();
    updatePlaylistUI();
    updatePlaylistCount();
    
    // Check if localStorage is available and working properly
    function isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            const result = localStorage.getItem(test);
            localStorage.removeItem(test);
            return result === test;
        } catch (e) {
            return false;
        }
    }
    
    // Check localStorage functionality
    if (!isLocalStorageAvailable()) {
        console.error('LocalStorage is not available or working!');
        showNotification('Warning: Playlist save/load feature unavailable', 'warning');
    } else {
        console.log('LocalStorage is working properly');
    }
    
    // Load theme on page load
    loadSavedTheme();
    
    // Try loading the playlist when page loads (with delay to ensure everything is initialized)
    setTimeout(() => {
        try {
            // Read directly from localStorage
            const savedPlaylist = localStorage.getItem('mojarPlayerPlaylist');
            console.log('Found saved playlist:', savedPlaylist ? 'YES' : 'NO');
            
            if (savedPlaylist) {
                const loadedSuccessfully = loadPlaylistFromStorage();
                if (loadedSuccessfully) {
                    showNotification(`Loaded saved playlist with ${playlistItems.length} item(s)`);
                    console.log('Playlist loaded successfully');
                }
            }
        } catch (e) {
            console.error('Error auto-loading playlist:', e);
        }
    }, 1500); // 1.5 second delay to ensure DOM is fully loaded
    
    // Add Save Playlist button
    const fileControls = document.querySelector('.file-controls');
    const savePlaylistBtn = document.createElement('button');
    savePlaylistBtn.id = 'savePlaylistBtn';
    savePlaylistBtn.className = 'control-button';
    savePlaylistBtn.innerHTML = '<i class="fas fa-save"></i> Save Playlist';
    savePlaylistBtn.addEventListener('click', () => {
        if (playlistItems.length > 0) {
            // Count how many HTTP/HTTPS URLs we have
            const webUrlCount = playlistItems.filter(item => 
                item.source.startsWith('http:') || item.source.startsWith('https:')
            ).length;
            
            if (webUrlCount === 0) {
                showNotification('No web URLs to save. Only HTTP/HTTPS URLs can be saved.', 'warning');
                return;
            }
            
            if (savePlaylistToStorage()) {
                showNotification(`Playlist saved with ${webUrlCount} item(s)`);
            } else {
                showNotification('Failed to save playlist', 'error');
            }
        } else {
            showNotification('Playlist is empty', 'warning');
        }
    });
    
    // Insert the Save button before the About button
    fileControls.insertBefore(savePlaylistBtn, aboutBtn);
    
    // Add Load Playlist button next to Save button
    const loadPlaylistBtn = document.createElement('button');
    loadPlaylistBtn.id = 'loadPlaylistBtn';
    loadPlaylistBtn.className = 'control-button';
    loadPlaylistBtn.innerHTML = '<i class="fas fa-folder-open"></i> Load Playlist';
    loadPlaylistBtn.addEventListener('click', () => {
        if (loadPlaylistFromStorage()) {
            showNotification(`Loaded playlist with ${playlistItems.length} item(s)`);
        } else {
            showNotification('No saved playlist found', 'warning');
        }
    });
    
    // Insert the Load button after Save button
    fileControls.insertBefore(loadPlaylistBtn, aboutBtn);
}); 