import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pediaendocrinologist.app",
  appName: "PHYSIS",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
