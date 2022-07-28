class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }

    init() {

    }

    preload() {
        this.load.image('player', '../assets/player_handgun.png');
        this.load.image('bullet', '../assets/bullet.png');
        this.load.image('zombie', '../assets/zombiebasic.png');
    }

    create() {
        this.player = this.physics.add.sprite(WIN_WIDTH / 2, WIN_HEIGHT / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.keys = this.input.keyboard.addKeys("W,A,S,D");

        this.bullets = this.physics.add.group()
        this.timeout = false;

        // draw the reticle 
        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xDA6A6A } });
        this.horizontalRecticle = new Phaser.Geom.Line(20, 0, 0, 0);
        this.verticalRecticle = new Phaser.Geom.Line(0, 20, 0, 0);
        this.horizontalRecticle.x = 50;
        this.horizontalRecticle.y = 50;
        this.verticalRecticle.x = 50;
        this.verticalRecticle.y = 50;

        this.input.on('pointermove', (pointer) => {

            this.horizontalRecticle.x = pointer.x;
            this.horizontalRecticle.y = pointer.y;
            this.verticalRecticle.x = pointer.x;
            this.verticalRecticle.y = pointer.y;

            Phaser.Geom.Line.CenterOn(this.horizontalRecticle, this.horizontalRecticle.x, this.horizontalRecticle.y);
            Phaser.Geom.Line.CenterOn(this.verticalRecticle, this.verticalRecticle.x, this.verticalRecticle.y);
        });

        this.input.on('pointerdown', () => {
            this.fireGun();
        })

        this.zombies = this.physics.add.group();
        setInterval(() => { this.spawnZombies() }, 2000);

        this.physics.add.collider(this.bullets, this.zombies, this.zombieShot, null, this);
    }

    update() {
        this.graphics.clear();
        this.graphics.strokeLineShape(this.horizontalRecticle);
        this.graphics.strokeLineShape(this.verticalRecticle);

        this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.horizontalRecticle.x, this.horizontalRecticle.y);

        if (this.keys.A.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
        }
        else if (this.keys.D.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
        }
        else {
            this.player.setVelocityX(0);
        }

        if (this.keys.W.isDown) {
            this.player.setVelocityY(-PLAYER_SPEED);
        }
        else if (this.keys.S.isDown) {
            this.player.setVelocityY(PLAYER_SPEED);
        }
        else {
            this.player.setVelocityY(0);
        }

        this.removeBullets();
        this.zombsMovement();
    }

    fireGun() {
        if (!this.timeout) {
            let newBullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
            this.bullets.add(newBullet);
            // Calculate X and y velocity of bullet to moves it from shooter to target
            let direction = Math.atan((this.horizontalRecticle.x - newBullet.x) / (this.horizontalRecticle.y - newBullet.y));

            if (this.horizontalRecticle.y >= newBullet.y) {
                newBullet.setVelocity(Math.sin(direction) * BULLET_SPEED, Math.cos(direction) * BULLET_SPEED)
            }
            else {
                newBullet.setVelocity(-(Math.sin(direction) * BULLET_SPEED), -(Math.cos(direction) * BULLET_SPEED))
            }

            newBullet.rotation = this.player.rotation; // angle bullet with shooters rotation

            this.timeout = true;
            setTimeout(() => { this.timeout = false }, 250);
        }
    }

    removeBullets() {
        let bList = this.bullets.getChildren();

        for (let i = bList.length - 1; i >= 0; i--) {
            if (bList[i].y > WIN_HEIGHT || bList[i].y < 0 || bList[i].x > WIN_WIDTH || bList[i].x < 0) {
                bList[i].destroy();
            }
        }

    }

    spawnZombies() {
        let side = Math.floor(Math.random() * 4);
        let spawny;
        let spawnx;
        let buffer = 50;

        if (side == 0) {
            spawny = -buffer;
            spawnx = Math.random() * WIN_WIDTH;
        }
        else if (side == 1) {
            spawny = Math.random() * WIN_HEIGHT;
            spawnx = WIN_WIDTH + buffer;
        }
        else if (side == 2) {
            spawny = WIN_HEIGHT + buffer;
            spawnx = Math.random() * WIN_WIDTH;
        }
        else if (side == 3) {
            spawny = Math.random() * WIN_HEIGHT;
            spawnx = -buffer;
        }

        for (let i = 0; i < 1; i++) {
            let newZomb = this.physics.add.sprite(spawnx + (10 * i), spawny, 'zombie');
            this.zombies.add(newZomb);
            newZomb.setScale(0.75);
            newZomb.lives = 3;
        }
    }

    zombsMovement() {
        let zombList = this.zombies.getChildren();

        for (let i = 0; i < zombList.length; i++) {
            let direction = Math.atan((zombList[i].x - this.player.x) / (zombList[i].y - this.player.y));
            if (zombList[i].y >= this.player.y) {
                zombList[i].setVelocity(-(Math.sin(direction) * ZOMBIE_SPEED), -(Math.cos(direction) * ZOMBIE_SPEED))
            }
            else {
                zombList[i].setVelocity(Math.sin(direction) * ZOMBIE_SPEED, Math.cos(direction) * ZOMBIE_SPEED)
            }

            zombList[i].rotation = Phaser.Math.Angle.Between(zombList[i].x, zombList[i].y, this.player.x, this.player.y); // angle bullet with shooters rotation
        }
    }

    zombieShot(bullet, zomb) {
        bullet.destroy();
        zomb.lives--;
        if (!zomb.lives) {
            zomb.destroy();
        }
    }
}