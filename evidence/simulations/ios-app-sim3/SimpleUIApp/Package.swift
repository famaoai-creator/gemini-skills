// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SimpleUIApp",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "SimpleUIApp", targets: ["SimpleUIApp"]),
    ],
    targets: [
        .target(name: "SimpleUIApp"),
        .testTarget(
            name: "SimpleUIAppTests",
            dependencies: ["SimpleUIApp"]
        ),
    ]
)
