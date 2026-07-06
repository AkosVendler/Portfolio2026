const sounds = {
    click: new Audio("./media/click.wav"),
    close: new Audio("./media/close.wav"),
};

function playSound(soundName) {
    const sound = sounds[soundName];

    if (!sound) {
        console.warn(`Sound "${soundName}" not found.`);
        return;
    }

    sound.currentTime = 0; // mindig az elejéről induljon
    sound.play();
}