import LocalizedStrings from "react-localization";

export const strings = new LocalizedStrings({
  en: {
    // Dev screen
    devUnhandledError: "Unhandled render error",
    devPreviewCustomerView: "Preview customer view",
    devPreviewBanner: "DEV PREVIEW",
    devPreviewSub: "Customer view — no stack traces are shown below",
    devPreviewBack: "← Back to dev view",
    devCopy: "Copy",
    devCopied: "Copied!",
    devTryAgain: "Try again",
    devReloadPage: "Reload page",
    devJsStack: "JavaScript stack",
    devComponentStack: "React component stack",

    // Prod screen
    prodTitle: "Something went wrong",
    prodSub:
      "Moran ran into an unexpected problem. Your library and watchlist are safe — this is a display issue only.",
    prodThingsToTry: "Things to try",
    prodStep1Label: "Retry",
    prodStep1Body: "— tap the button below to reload just this screen without a full page refresh.",
    prodStep2Label: "Reload the page",
    prodStep2Body: "— a full browser reload clears any stale state.",
    prodStep3Label: "Clear your cache",
    prodStep3Body: "— open your browser\u2019s history settings, clear cached files, then reload.",
    prodTryAgain: "Try again",
    prodReloadPage: "Reload page",
    prodContact: "Still having trouble? Contact your system administrator.",
  },
});
