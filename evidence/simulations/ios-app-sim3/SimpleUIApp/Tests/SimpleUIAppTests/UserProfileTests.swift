import XCTest
@testable import SimpleUIApp

final class UserProfileTests: XCTestCase {
    func testProfileDescription() {
        let profile = UserProfile(name: "John Doe", age: 30)
        XCTAssertEqual(profile.description, "John Doe (30 years old)")
    }
}
