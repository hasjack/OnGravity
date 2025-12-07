//
//  Entity.swift
//  Aquarium
//
//  Created by HAS Studios on 01/12/2025.
//

// Entity.swift
import SpriteKit

struct Vec2 { var x: Double; var y: Double }

protocol Entity {
    var pos: Vec2 { get set }
    var vel: Vec2 { get set }
    var node: SKShapeNode { get }
    func stepPhysics(fishes: [Fish], predators: [Predator], dt: Double, sceneSize: CGSize)
    func updateVisual()
}
