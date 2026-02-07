import XCTest
@testable import GreetingApp

final class GreetingLogicTests: XCTestCase {
    var sut: GreetingLogic!

    override func setUp() {
        super.setUp()
        sut = GreetingLogic()
    }

    func testGenerateGreeting_withName_returnsGreeting() {
        let result = sut.generateGreeting(name: "Taro")
        XCTAssertEqual(result, "こんにちは、Taroさん！")
    }

    func testGenerateGreeting_withEmptyName_returnsErrorMessage() {
        let result = sut.generateGreeting(name: "")
        XCTAssertEqual(result, "名前を入力してください")
    }
}
