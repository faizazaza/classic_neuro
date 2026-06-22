import { Container, Graphics } from "pixi.js";
import { engine } from "../getEngine";

export class ConfettiEmitter extends Container {
    private particles: ConfettiParticle[] = [];

    constructor() {
        super();
        engine().ticker.add(this.update, this);
    }

    burst(x: number, y: number, amount = 50) {
        for (let i = 0; i < amount; i++) {
            const p = new ConfettiParticle(x, y);
            this.particles.push(p);
            this.addChild(p);
        }
    }

    private update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();

            if (p.life <= 0) {
                this.removeChild(p);
                p.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}

class ConfettiParticle extends Graphics {
    vx: number;
    vy: number;
    rotationSpeed: number;
    life: number;

    constructor(x: number, y: number) {
        super();

        const colors = [
            0xff4b4b,
            0xffd93d,
            0x6bcB77,
            0x4d96ff,
            0xff6f91,
            0x845ec2,
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];

        this.rect(0, 0, 6, 10).fill({ color });

        this.x = x;
        this.y = y;

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.life = 200;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.vy += 0.05; // gravity
        this.life--;
        this.alpha = this.life / 200;
    }
}