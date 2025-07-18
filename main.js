document.addEventListener('DOMContentLoaded', () => {

    // --- Audio Player for Module 1 ---
    const playMusicBtn = document.getElementById('play-music-btn');
    let audioContext;
    let audioBuffer;
    let sourceNode;
    let isPlaying = false;

    // Set up Web Audio API
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            fetch('binaural-852hz.mp3')
                .then(response => response.arrayBuffer())
                .then(data => audioContext.decodeAudioData(data))
                .then(buffer => {
                    audioBuffer = buffer;
                })
                .catch(e => console.error("Error loading audio file", e));
        }
    }

    playMusicBtn.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }

        if (isPlaying) {
            sourceNode.stop();
            isPlaying = false;
            playMusicBtn.textContent = 'Play Music';
            audioContext.suspend();
        } else {
            // Resume context if it was suspended
            if (audioContext.state === 'suspended') {
                 audioContext.resume();
            }
            
            sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContext.destination);
            sourceNode.loop = true;
            sourceNode.start(0);
            isPlaying = true;
            playMusicBtn.textContent = 'Pause Music';
        }
    });

    // --- Breathing Exercise for Module 3 ---
    const breathingBtn = document.getElementById('breathing-btn');
    const breathingGuide = document.getElementById('breathing-guide');
    const breathingText = document.getElementById('breathing-text');
    let isBreathing = false;
    let breathingInterval;
    const instructions = [
        { text: 'Inhale...', duration: 4000 },
        { text: 'Hold', duration: 4000 },
        { text: 'Exhale...', duration: 4000 }
    ];

    function runBreathingCycle() {
        let currentIndex = 0;

        function updateInstruction() {
            breathingText.textContent = instructions[currentIndex].text;
            const currentDuration = instructions[currentIndex].duration;
            currentIndex = (currentIndex + 1) % instructions.length;
            breathingInterval = setTimeout(updateInstruction, currentDuration);
        }
        updateInstruction();
    }

    breathingBtn.addEventListener('click', () => {
        if (isBreathing) {
            isBreathing = false;
            breathingBtn.textContent = 'Start Exercise';
            breathingGuide.classList.remove('breathing');
            clearTimeout(breathingInterval);
            breathingText.textContent = 'Press Start to Begin';
        } else {
            isBreathing = true;
            breathingBtn.textContent = 'Stop Exercise';
            breathingGuide.classList.add('breathing');
            runBreathingCycle();
        }
    });

    // --- Affirmations for Module 4 ---
    const affirmations = [
        "My kidneys are vibrant, healthy, and function perfectly.",
        "I release all fear and trauma from my body and cells.",
        "Every cell in my kidneys is regenerating and renewing itself.",
        "I drink pure, living water that cleanses and heals me.",
        "I am filled with courage and peace.",
        "My body's innate wisdom is restoring perfect balance.",
        "I love and approve of myself and my body.",
        "I release the past and live in the joyful present.",
        "My energy flows freely, bringing vitality to my kidneys.",
        "I am whole, healed, and complete."
    ];

    const affirmationsContainer = document.getElementById('affirmations-container');
    let activeAudio = null;
    let activeAffirmationElement = null;

    affirmations.forEach((text, index) => {
        const affirmationEl = document.createElement('div');
        affirmationEl.classList.add('affirmation');
        affirmationEl.textContent = text;
        affirmationEl.dataset.index = index;

        const audio = new Audio(`affirmation-${index}.mp3`);

        affirmationEl.addEventListener('click', () => {
            if (activeAudio) {
                activeAudio.pause();
                activeAudio.currentTime = 0;
                if(activeAffirmationElement) {
                    activeAffirmationElement.classList.remove('playing');
                }
            }

            if (activeAudio !== audio) {
                audio.play();
                activeAudio = audio;
                affirmationEl.classList.add('playing');
                activeAffirmationElement = affirmationEl;
    
                audio.onended = () => {
                    affirmationEl.classList.remove('playing');
                    activeAudio = null;
                    activeAffirmationElement = null;
                };
            } else {
                // If clicking the same one, just stop it
                activeAudio = null;
                activeAffirmationElement = null;
            }
        });

        affirmationsContainer.appendChild(affirmationEl);
    });

    // --- Journal Tracker for Module 5 ---
    const journalForm = document.getElementById('journal-form');
    const journalTitle = document.getElementById('journal-title');
    const saveEntryBtn = document.getElementById('save-entry-btn');
    const physicalStateInput = document.getElementById('physical-state');
    const emotionalStateInput = document.getElementById('emotional-state');
    const symbolicNotesInput = document.getElementById('symbolic-notes');
    let chart;

    const JOURNAL_KEY = 'kidneyHealingJournal';
    const MAX_DAYS = 21;

    function getJournalData() {
        return JSON.parse(localStorage.getItem(JOURNAL_KEY)) || [];
    }

    function saveJournalData(data) {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(data));
    }

    function renderChart(data) {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const labels = data.map((_, i) => `Day ${i + 1}`);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Physical State',
                        data: data.map(entry => entry.physical),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: 'Emotional State',
                        data: data.map(entry => entry.emotional),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                        tension: 0.3,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: { display: true, text: 'Rating (1-10)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterBody: function(context) {
                                const dataIndex = context[0].dataIndex;
                                const notes = data[dataIndex].notes;
                                return notes ? `\nNotes: ${notes}` : '';
                            }
                        }
                    }
                }
            }
        });
        document.getElementById('chart-container').style.height = '300px';
    }

    function updateJournalUI() {
        const journalData = getJournalData();
        const currentDay = journalData.length + 1;

        if (currentDay > MAX_DAYS) {
            journalTitle.textContent = "Journey Complete!";
            journalForm.style.display = 'none';
        } else {
            journalTitle.textContent = `Day ${currentDay} Entry`;
            journalForm.reset();
        }

        if (journalData.length > 0) {
            renderChart(journalData);
        }
    }
    
    journalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const journalData = getJournalData();

        if (journalData.length >= MAX_DAYS) return;

        const newEntry = {
            physical: physicalStateInput.value,
            emotional: emotionalStateInput.value,
            notes: symbolicNotesInput.value.trim()
        };

        journalData.push(newEntry);
        saveJournalData(journalData);
        updateJournalUI();
    });

    // Initial load
    updateJournalUI();

});