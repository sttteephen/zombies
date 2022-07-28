var config = {
    type: Phaser.AUTO,
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
    physics: {
        default: 'arcade',
        gravity: { y: 0 }
    },
    scene: [GamePlay],
    scale: {
        parent: 'zombies-game',
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

var game = new Phaser.Game(config);
