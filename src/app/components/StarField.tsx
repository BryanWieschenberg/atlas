"use client";

import { useEffect, useRef } from "react";

interface StarFieldProps {
    width: number;
    height: number;
}

export default function StarField({ width, height }: StarFieldProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !width || !height) return;
        const ctx = canvas.getContext("2d")!;

        const layers = [
            Array.from({ length: 180 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 0.6 + 0.1,
                phase: Math.random() * Math.PI * 2,
                spd: Math.random() * 0.003 + 0.001,
                cr: 190,
                cg: 210,
                cb: 255,
                maxA: 0.45,
            })),
            Array.from({ length: 90 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 0.9 + 0.3,
                phase: Math.random() * Math.PI * 2,
                spd: Math.random() * 0.005 + 0.002,
                cr: 220,
                cg: 225,
                cb: 255,
                maxA: 0.65,
            })),
            Array.from({ length: 30 }, () => {
                const w = Math.random() > 0.6;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 1.4 + 0.6,
                    phase: Math.random() * Math.PI * 2,
                    spd: Math.random() * 0.007 + 0.003,
                    cr: w ? 255 : 200,
                    cg: w ? 230 : 220,
                    cb: w ? 190 : 255,
                    maxA: 0.85,
                };
            }),
        ].flat();

        const nebulae = [
            {
                x: width * 0.72,
                y: height * 0.22,
                rx: width * 0.28,
                ry: height * 0.22,
                r: 60,
                g: 80,
                b: 160,
                a: 0.045,
            },
            {
                x: width * 0.15,
                y: height * 0.65,
                rx: width * 0.22,
                ry: height * 0.28,
                r: 80,
                g: 40,
                b: 140,
                a: 0.038,
            },
            {
                x: width * 0.55,
                y: height * 0.78,
                rx: width * 0.2,
                ry: height * 0.18,
                r: 20,
                g: 80,
                b: 120,
                a: 0.032,
            },
            {
                x: width * 0.88,
                y: height * 0.55,
                rx: width * 0.16,
                ry: height * 0.22,
                r: 100,
                g: 50,
                b: 160,
                a: 0.028,
            },
        ];

        interface Shooter {
            x: number;
            y: number;
            len: number;
            speed: number;
            angle: number;
            life: number;
            maxLife: number;
            active: boolean;
            nextAt: number;
        }
        const makeShooter = (): Shooter => ({
            x: Math.random() * width,
            y: Math.random() * height * 0.6,
            len: Math.random() * 90 + 40,
            speed: Math.random() * 8 + 5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 0,
            maxLife: Math.random() * 40 + 25,
            active: false,
            nextAt: Math.random() * 400 + 100,
        });
        const shooters: Shooter[] = Array.from({ length: 4 }, makeShooter);

        const offscreen = document.createElement("canvas");
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext("2d")!;
        nebulae.forEach((n) => {
            const maxR = Math.max(n.rx, n.ry);
            const grd = octx.createRadialGradient(n.x, n.y, 0, n.x, n.y, maxR);
            grd.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.a})`);
            grd.addColorStop(0.5, `rgba(${n.r},${n.g},${n.b},${(n.a * 0.4).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
            octx.save();
            octx.scale(n.rx / maxR, n.ry / maxR);
            octx.beginPath();
            octx.arc((n.x * maxR) / n.rx, (n.y * maxR) / n.ry, maxR, 0, Math.PI * 2);
            octx.fillStyle = grd;
            octx.fill();
            octx.restore();
        });

        let raf: number;

        const draw = () => {
            ctx.fillStyle = "#01020d";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(offscreen, 0, 0);

            layers.forEach((s) => {
                const alpha = s.maxA * (0.6 + 0.4 * Math.sin(Date.now() * s.spd + s.phase));
                ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${alpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });

            shooters.forEach((s) => {
                if (!s.active) {
                    s.nextAt--;
                    if (s.nextAt <= 0) {
                        Object.assign(s, makeShooter(), { active: true, life: 0 });
                    }
                    return;
                }
                s.life++;
                const progress = s.life / s.maxLife;
                const alpha = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
                const tx = s.x + Math.cos(s.angle) * s.speed * s.life;
                const ty = s.y + Math.sin(s.angle) * s.speed * s.life;
                const tailX = tx - Math.cos(s.angle) * s.len * alpha;
                const tailY = ty - Math.sin(s.angle) * s.len * alpha;
                const grd = ctx.createLinearGradient(tailX, tailY, tx, ty);
                grd.addColorStop(0, "rgba(255,255,255,0)");
                grd.addColorStop(1, `rgba(220,235,255,${(alpha * 0.7).toFixed(2)})`);
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(tx, ty);
                ctx.strokeStyle = grd;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                if (s.life >= s.maxLife) {
                    s.active = false;
                    s.nextAt = Math.random() * 500 + 200;
                }
            });

            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(raf);
    }, [width, height]);

    return (
        <canvas
            ref={ref}
            width={width}
            height={height}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
    );
}
