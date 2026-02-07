import Foundation

public struct UserProfile {
    public let name: String
    public let age: Int
    
    public init(name: String, age: Int) {
        self.name = name
        self.age = age
    }
    
    public var description: String {
        return "\(name) (\(age) years old)"
    }
}
