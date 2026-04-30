# Android WebView Handoff Skeleton

最小構成の Android sample app skeleton です。debug-only handoff export と、WebView login 画面、broadcast trigger の wiring まで含みます。

## Files

- [`settings.gradle.kts`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/settings.gradle.kts)
- [`app/build.gradle.kts`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/build.gradle.kts)
- [`AndroidManifest.xml`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/AndroidManifest.xml)
- [`MainActivity.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/MainActivity.kt)
- [`WebViewLoginActivity.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/WebViewLoginActivity.kt)
- [`ExampleApplication.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/ExampleApplication.kt)
- [`SessionRepository.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/session/SessionRepository.kt)
- [`AndroidWebViewStateReader.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/handoff/AndroidWebViewStateReader.kt)
- [`DebugHandoffReceiver.kt`](knowledge/public/templates/mobile-sample-apps/android-webview-handoff-skeleton/app/src/main/java/com/example/mobile/handoff/DebugHandoffReceiver.kt)

## Trigger

```bash
adb shell am broadcast \
  -a com.kyberion.debug.EXPORT_WEBVIEW_SESSION \
  --es reason manual_debug
```

## Expected Export

- canonical:
  `filesDir/kyberion/webview-session.json`
- mirrored:
  `/sdcard/kyberion/example-mobile-login-passkey/webview-session.json`

これは [`example-mobile-login-passkey.json`](knowledge/public/orchestration/mobile-app-profiles/example-mobile-login-passkey.json) と揃っています。
