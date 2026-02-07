import Foundation

public struct GreetingLogic {
    public init() {}

    public func generateGreeting(name: String) -> String {
        guard !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return "名前を入力してください"
        }
        return "こんにちは、\(name)さん！"
    }
}
