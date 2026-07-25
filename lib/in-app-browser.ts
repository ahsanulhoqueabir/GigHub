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

/**
 * Opens a payment/checkout URL as a Custom Tab (Android) / SFSafariViewController
 * (iOS) auth session — the same sanctioned, non-blocked browser context banks and
 * payment gateways expect for OTP/3D-Secure steps.
 *
 * Unlike `openInAppBrowser`, this uses `openAuthSessionAsync`, which watches for
 * the gateway's redirect back to this app's `gighub://` scheme and automatically
 * dismisses the sheet the moment that happens — the user never has to manually
 * close it, and control returns straight to the app.
 */
export async function openPaymentSession(url: string): Promise<void> {
  try {
    const hasNativeWebBrowser = !!requireOptionalNativeModule("ExpoWebBrowser");
    if (hasNativeWebBrowser) {
      const WebBrowser = require("expo-web-browser");
      if (WebBrowser && typeof WebBrowser.openAuthSessionAsync === "function") {
        await WebBrowser.openAuthSessionAsync(url, "gighub://", {
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
