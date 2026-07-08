const sounds = {
    click: new Audio("http://localhost:5500/media/click.wav"),
};

function playSound(soundName) {
    const sound = sounds[soundName];

    if (!sound) {
        console.warn(`Sound "${soundName}" not found.`);
        return;
    }

    sound.currentTime = 0;
    sound.play();
}