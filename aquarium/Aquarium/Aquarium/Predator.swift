//
//  Predator.swift
//  Aquarium
//
//  Created by HAS Studios on 01/12/2025.
//

import SpriteKit

class Predator: Entity {
    var pos: Vec2
    var vel: Vec2
    let node: SKShapeNode

    init(position: Vec2) {
        self.pos = position
        self.vel = Vec2(x: Double.random(in: -1...1),
                        y: Double.random(in: -1...1))
        self.node = SKShapeNode(circleOfRadius: 20)
        self.node.fillColor = .red
        self.node.strokeColor = .white
        self.node.lineWidth = 2
    }

    func stepPhysics(fishes: [Fish], predators: [Predator], dt: Double, sceneSize: CGSize) {
        // Simple hunting behavior: move toward nearest fish
        if let target = fishes.min(by: { hypot($0.pos.x - pos.x, $0.pos.y - pos.y) <
                                        hypot($1.pos.x - pos.x, $1.pos.y - pos.y) }) {
            let dx = target.pos.x - pos.x
            let dy = target.pos.y - pos.y
            let dist = max(0.001, hypot(dx, dy))
            let speed = 2.0
            vel.x = dx / dist * speed
            vel.y = dy / dist * speed
        }

        pos.x += vel.x
        pos.y += vel.y
    }

    func updateVisual() {
        node.position = CGPoint(x: pos.x, y: pos.y)
    }
}

