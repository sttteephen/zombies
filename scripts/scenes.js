class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }

    init() {

    }

    preload() {
        this.load.image('player', '../assets/player_handgun.png');
        this.load.image('bullet', '../assets/bullet.png');
    }

    create() {

        this.bullets = this.physics.add.group()
        this.timeout = false;

        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xDA6A6A } });
        this.horizontalRecticle = new Phaser.Geom.Line(20, 0, 0, 0);
        this.verticalRecticle = new Phaser.Geom.Line(0, 20, 0, 0);

        this.player = this.physics.add.sprite(WIN_WIDTH / 2, WIN_HEIGHT / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.keys = this.input.keyboard.addKeys("W,A,S,D");


        this.input.on('pointermove', (pointer) => {

            this.horizontalRecticle.x = pointer.midPoint.x;
            this.horizontalRecticle.y = pointer.midPoint.y;
            this.verticalRecticle.x = pointer.midPoint.x;
            this.verticalRecticle.y = pointer.midPoint.y;

            Phaser.Geom.Line.CenterOn(this.horizontalRecticle, this.horizontalRecticle.x, this.horizontalRecticle.y);
            Phaser.Geom.Line.CenterOn(this.verticalRecticle, this.verticalRecticle.x, this.verticalRecticle.y);
        });

        this.input.on('pointerdown', () => {
            this.fireGun();
        })
    }

    update() {
        this.graphics.clear();
        this.graphics.strokeLineShape(this.horizontalRecticle);
        this.graphics.strokeLineShape(this.verticalRecticle);

        this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.horizontalRecticle
            .x, this.horizontalRecticle.y);

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
    }

    fireGun() {
        if (!this.timeout) {
            let newBullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
            this.bullets.add(newBullet);
            // Calculate X and y velocity of bullet to moves it from shooter to target
            let direction = Math.atan((this.horizontalRecticle.x - newBullet.x) / (this.horizontalRecticle.y - newBullet.y));

            if (this.horizontalRecticle.y >= newBullet.y) {
                newBullet.setVelocityX(Math.sin(direction) * BULLET_SPEED)
                newBullet.setVelocityY(Math.cos(direction) * BULLET_SPEED)
            }
            else {
                newBullet.setVelocityX(-(Math.sin(direction) * BULLET_SPEED))
                newBullet.setVelocityY(-(Math.cos(direction) * BULLET_SPEED))
            }

            newBullet.rotation = this.player.rotation; // angle bullet with shooters rotation

            this.timeout = true;
            setTimeout(() => { this.timeout = false }, 250);
        }
    }

    removeBullets() {
        let bList = this.bullets.getChildren();

        if (bList.length > 0) {
            for (let i = bList.length - 1; i >= 0; i--) {
                if (bList[i].y > WIN_HEIGHT || bList[i].y < 0 || bList[i].x > WIN_WIDTH || bList[i].x < 0) {
                    bList[i].destroy();
                }
            }
        }
    }
}