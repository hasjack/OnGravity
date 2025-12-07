//
// Fish.swift
// Aquarium
//
// Created by HAS Studios on 01/12/2025.
//

import SpriteKit

class Fish: Entity {
    var pos: Vec2
    var vel: Vec2
    let node: SKShapeNode

    init(position: Vec2) {
        self.pos = position
        self.vel = Vec2(
            x: Double.random(in: -1.5...1.5),
            y: Double.random(in: -1.5...1.5)
        )
        self.node = SKShapeNode()
        setupNode()
    }

    private func setupNode() {
        let path = CGMutablePath()
        path.move(to: CGPoint(x: 9, y: 0))
        path.addLine(to: CGPoint(x: -5, y: -5))
        path.addLine(to: CGPoint(x: -5, y: 5))
        path.closeSubpath()
        node.path = path
        node.lineWidth = 0.5
        node.strokeColor = SKColor(
            hue: CGFloat(Double.random(in: 0...360)/360),
            saturation: 0.85,
            brightness: 0.65,
            alpha: 1
        )
        node.fillColor = .clear
    }

    func stepPhysics(fishes: [Fish], predators: [Predator], dt: Double, sceneSize: CGSize) {
        var ax = 0.0
        var ay = 0.0
        var alignX = 0.0
        var alignY = 0.0
        var neighbors = 0

        let k0 = 0.07
        let alignFactor = 1.2

        // --- Fish interactions ---
        for f in fishes {
            if f === self { continue }
            let dx = f.pos.x - pos.x
            let dy = f.pos.y - pos.y
            let r = max(0.001, hypot(dx, dy))

            if r < 5 { ax -= dx / r * 2; ay -= dy / r * 2 }
            if r > 10 && r < 100 {
                let force = exp(k0 * r * 0.018) / r
                ax += dx / r * force * 1.1
                ay += dy / r * force * 1.1
            }
            if r < 32 {
                alignX += f.vel.x
                alignY += f.vel.y
                neighbors += 1
            }
        }

        if neighbors > 0 {
            let mag = hypot(alignX, alignY)
            if mag > 0 {
                ax += (alignX / mag) * alignFactor * 0.5
                ay += (alignY / mag) * alignFactor * 0.5
            }
        }

        // --- Predator avoidance ---
        for p in predators {
            let dx = pos.x - p.pos.x
            let dy = pos.y - p.pos.y
            let r = max(0.001, hypot(dx, dy))
            if r < 140 {
                let strength = (140 - r) * 0.18
                ax += dx / r * strength
                ay += dy / r * strength
            }
        }

        // --- Update velocity ---
        vel.x += ax * 0.028
        vel.y += ay * 0.028

        // Clamp speed
        let speed = hypot(vel.x, vel.y)
        if speed > 4.8 { vel.x *= 4.8/speed; vel.y *= 4.8/speed }

        // --- Update position ---
        pos.x += vel.x
        pos.y += vel.y

        // --- Reflective tank walls ---
        let maxX = Double(sceneSize.width)/2 - 10
        let maxY = Double(sceneSize.height)/2 - 10

        if pos.x < -maxX { pos.x = -maxX; vel.x *= -1 }
        if pos.x >  maxX { pos.x =  maxX; vel.x *= -1 }
        if pos.y < -maxY { pos.y = -maxY; vel.y *= -1 }
        if pos.y >  maxY { pos.y =  maxY; vel.y *= -1 }
    }

    func updateVisual() {
        node.position = CGPoint(x: pos.x, y: pos.y)
        node.zRotation = CGFloat(atan2(vel.y, vel.x))
    }
}
