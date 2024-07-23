let countdown;
let timeRemaining;
let isPaused = false;
let currentTimerId = null; // To track the currently edited timer

// Event listener for setting the timer
document.getElementById('set-timer').addEventListener('click', async () => {
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    timeRemaining = minutes * 60 + seconds;

    // Save the timer to db.json
    try {
        await fetch('/db.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: Date.now(), name: 'New Timer', minutes, seconds }) // Use a timestamp as a unique ID
        });
        fetchTimers(); // Refresh the list of timers after setting
    } catch (error) {
        console.error('Error adding timer:', error);
    }

    displayTime(timeRemaining);
});

// Event listener for starting the timer
document.getElementById('start').addEventListener('click', () => {
    if (timeRemaining > 0 && !countdown) {
        countdown = setInterval(() => {
            if (!isPaused) {
                timeRemaining--;
                displayTime(timeRemaining);
                if (timeRemaining <= 0) {
                    clearInterval(countdown);
                    countdown = null;
                    alert('Time is up!');
                }
            }
        }, 1000);
    }
});

// Event listener for pausing the timer
document.getElementById('pause').addEventListener('click', () => {
    isPaused = true;
});

// Event listener for resuming the timer
document.getElementById('resume').addEventListener('click', () => {
    isPaused = false;
});

// Event listener for resetting the timer
document.getElementById('reset').addEventListener('click', () => {
    clearInterval(countdown);
    countdown = null;
    timeRemaining = 0;
    displayTime(timeRemaining);
});

// Event listener for deleting the timer
document.getElementById('delete-timer').addEventListener('click', async () => {
    if (currentTimerId !== null) {
        try {
            await fetch(`/db.json/${currentTimerId}`, {
                method: 'DELETE'
            });
            currentTimerId = null;
            timeRemaining = 0;
            displayTime(timeRemaining);
            fetchTimers(); // Refresh the list of timers after deletion
        } catch (error) {
            console.error('Error deleting timer:', error);
        }
    }
});

// Event listener for editing the timer
document.getElementById('edit-timer').addEventListener('click', async () => {
    if (currentTimerId !== null) {
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        timeRemaining = minutes * 60 + seconds;

        try {
            await fetch(`/db.json/${currentTimerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minutes, seconds })
            });
            displayTime(timeRemaining);
            fetchTimers(); // Refresh the list of timers after editing
        } catch (error) {
            console.error('Error updating timer:', error);
        }
    }
});

// Function to display the time
function displayTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('countdown').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Fetch and display timers
async function fetchTimers() {
    try {
        const response = await fetch('/db.json');
        const data = await response.json();
        const timerList = document.getElementById('timer-items');
        timerList.innerHTML = ''; // Clear the current list

        data.forEach(timer => {
            const li = document.createElement('li');
            li.textContent = `${timer.name}: ${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`;
            li.dataset.id = timer.id;
            li.addEventListener('click', () => {
                // Select the timer for editing or deletion
                currentTimerId = timer.id;
                document.getElementById('minutes').value = timer.minutes;
                document.getElementById('seconds').value = timer.seconds;
            });
            timerList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call fetchTimers on page load to get and display existing timers
fetchTimers();