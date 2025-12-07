// AquariumScene.swift
import SpriteKit

class AquariumScene: SKScene {
    private var fishes: [Fish] = []
    private var predators: [Predator] = []

    override func didMove(to view: SKView) {
        backgroundColor = SKColor(red: 0, green: 0.05, blue: 0.10, alpha: 1)
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        initEntities()
    }


    func initEntities() {
        // Clear old nodes
        for fish in fishes { fish.node.removeFromParent() }
        for predator in predators { predator.node.removeFromParent() }
        fishes.removeAll()
        predators.removeAll()

        // Create fish
        for _ in 0..<400 {
            let angle = Double.random(in: 0..<2*Double.pi)
            let radius = Double.random(in: 15...70)
            let fish = Fish(position: Vec2(x: cos(angle)*radius, y: sin(angle)*radius))
            fishes.append(fish)
            addChild(fish.node)
        }

        let predatorCount = 2  // choose how many predators you want
        for _ in 0..<predatorCount {
            let x = Double.random(in: -size.width/2...size.width/2)
            let y = Double.random(in: -size.height/2...size.height/2)
            let predator = Predator(position: Vec2(x: x, y: y))
            predators.append(predator)
            addChild(predator.node)
        }
        let predator = Predator(position: Vec2(x: 0, y: 0))
        predators.append(predator)
        addChild(predator.node)
    }

    override func update(_ currentTime: TimeInterval) {
        let dt = 0.016

        // Step physics
        for fish in fishes {
            fish.stepPhysics(fishes: fishes, predators: predators, dt: dt, sceneSize: size)
        }
        for predator in predators {
            predator.stepPhysics(fishes: fishes, predators: predators, dt: dt, sceneSize: size)
        }

        // Update visuals
        for fish in fishes { fish.updateVisual() }
        for predator in predators { predator.updateVisual() }
    }
}
