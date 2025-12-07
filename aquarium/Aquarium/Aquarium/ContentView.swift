// ContentView.swift
import SwiftUI
import SpriteKit

struct ContentView: View {
    var scene = AquariumScene(size: CGSize(width: 800, height: 600))

    var body: some View {
        GeometryReader { geometry in
            SpriteView(scene: {
                scene.size = geometry.size
                return scene
            }())
            .ignoresSafeArea()
            .background(Color.black)
        }
    }
}
