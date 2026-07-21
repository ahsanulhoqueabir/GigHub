import { requireOptionalNativeModule } from "expo-modules-core";
import { Linking } from "react-native";

/**
 * Safely opens a URL in an in-app browser sheet using expo-web-browser.
 * Checks if the native binary contains 'ExpoWebBrowser'. If not (e.g. before app rebuild),
 * it gracefully falls back to Linking.openURL without crashing the app.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  try {
    const hasNativeWebBrowser = !!requireOptionalNativeModule("ExpoWebBrowser");
    if (hasNativeWebBrowser) {
      const WebBrowser = require("expo-web-browser");
      if (WebBrowser && typeof WebBrowser.openBrowserAsync === "function") {
        await WebBrowser.openBrowserAsync(url, {
          toolbarColor: "#10b981",
          controlsColor: "#ffffff",
          dismissButtonStyle: "close",
        });
        return;
      }
    }
  } catch (_err) {
    // Native module not available or threw an error, fall back safely
  }

  await Linking.openURL(url);
}
