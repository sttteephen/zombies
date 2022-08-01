class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }

    init() {

    }

    preload() {
        this.load.image('player', '../assets/player_handgun.png');
        this.load.spritesheet('player-sheet', '../assets/player_sheet.png', { frameWidth: 54, frameHeight: 32 });
        this.load.image('bullet', '../assets/bullet.png');
        this.load.image('shotgun-blast', '../assets/shotgun_blast.png');
        this.load.image('zombie', '../assets/zombiebasic.png');
        this.load.image('splat1', '../assets/small_splat.png');
        this.load.image('splat2', '../assets/big_splat.png');
        this.load.audio('hurt', ['../assets/hurt.mp3']);
        this.load.audio('pistol-shot', ['../assets/pistol_shot.mp3']);
        this.load.audio('shotgun-sound', ['../assets/shotgun.mp3']);
        this.load.audio('splat', ['../assets/splat.mp3']);
    }

    create() {
        this.score = 0;
        this.lives = 10;
        this.scoreText = this.add.text(16, 10, 'SCORE: 0', { fontSize: '24px', fill: '#FFF' });
        this.livesText = this.add.text(16, WIN_HEIGHT - 35, 'LIVES: ' + this.lives, { fontSize: '24px', fill: '#FFF' });

        this.weapons = [
            {
                // pistol
                fireRate: 300,
                frame: 0,
                image: 'bullet',
                damage: 1,
                sound: 'pistol-shot'
            },
            {
                // ak
                fireRate: 150,
                frame: 1,
                image: 'bullet',
                damage: 1,
                sound: 'pistol-shot'
            },
            {
                // shotgun
                fireRate: 900,
                frame: 2,
                image: 'shotgun-blast',
                damage: 3,
                sound: 'shotgun-sound'
            },
            {
                // mingun
                fireRate: 1,
                frame: 3,
                image: 'bullet',
                damage: 1,
                sound: 'pistol-shot'
            }
        ]


        this.anims.create({
            key: 'playeranim',
            frames: this.anims.generateFrameNumbers('player-sheet'),
            repeat: -1
        })
        this.player = this.physics.add.sprite(WIN_WIDTH / 2, WIN_HEIGHT / 2, 'player-sheet', 0);
        this.player.setCollideWorldBounds(true);
        this.player.justHit = false;
        this.player.currentWeapon = this.weapons[0]
        this.player.changeWeapon = (weaponNum) => {
            this.player.currentWeapon = this.weapons[weaponNum];
            this.player.setFrame(this.player.currentWeapon.frame)
        }

        this.keys = this.input.keyboard.addKeys("W,A,S,D,ONE,TWO,THREE,FOUR,FIVE");
        this.keys.ONE.on('down', () => { this.player.changeWeapon(0) });
        this.keys.TWO.on('down', () => { this.player.changeWeapon(1) });
        this.keys.THREE.on('down', () => { this.player.changeWeapon(2) });
        this.keys.FOUR.on('down', () => { this.player.changeWeapon(3) });
        this.keys.FIVE.on('down', () => { this.player.changeWeapon(4) });
        //console.log(this.keys)

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

        this.pointer = this.input.activePointer;

        this.zombies = this.physics.add.group();
        setInterval(() => { this.spawnZombies() }, 2000);

        this.physics.add.collider(this.bullets, this.zombies, this.zombieShot, null, this);
        this.physics.add.collider(this.zombies, this.player, this.playerHit, null, this);
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

        if (this.pointer.isDown) {
            this.fireGun();
        }

        this.removeBullets();
        this.zombsMovement();
    }

    fireGun() {
        if (!this.timeout) {
            let newBullet = this.physics.add.sprite(this.player.x, this.player.y, this.player.currentWeapon.image);
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
            newBullet.damage = this.player.currentWeapon.damage;

            this.sound.play(this.player.currentWeapon.sound);
            this.timeout = true;
            setTimeout(() => { this.timeout = false }, this.player.currentWeapon.fireRate);
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
        for (let i = 0; i < 2; i++) {
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
        zomb.lives -= bullet.damage;

        if (!zomb.lives) {
            let newSplat = this.add.image(zomb.x, zomb.y, 'splat1');
            newSplat.depth = -1;
            zomb.destroy();

            this.sound.play('splat');
            this.score += 10;
            this.scoreText.setText("SCORE: " + this.score);
        }
    }

    playerHit() {
        if (!this.player.justHit) {
            this.lives--;
            this.livesText.setText('LIVES: ' + this.lives);

            this.sound.play('hurt');
            this.player.justHit = true;
            setTimeout(() => { this.player.justHit = false }, 500);
        }
    }
}