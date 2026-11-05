# NutriLoop 🍎🔁

A bilingual (Arabic / English) healthy-habits game for kids: build a balanced
plate (MyPlate), learn serving sizes, drink water, move with a camera coach,
and practise Islamic table manners. Parents get a PIN-locked dashboard with
WHO growth curves, NASEM 2023 energy needs and Dietary Guidelines 2025–2030
servings. Kids never see calories or weight, only portions.

Runs fully offline: PWA, single-file PC build, and Android APK (Capacitor).

## Build

```bash
npm install
npm run build              # PWA -> dist/
npm run build:single       # one offline HTML for PC -> single/
npm run android            # sync web build into the Android project
```

The Android APK is built and signed by GitHub Actions (`.github/workflows/android.yml`).

## Sources
- WHO Child Growth Standards (2006) and WHO Growth Reference 5–19 y (2007)
- NASEM, Dietary Reference Intakes for Energy (2023), Table 5-5
- Dietary Guidelines for Americans 2025–2030, daily servings by calorie level
- MediaPipe Pose (Apache-2.0) for on-device rep counting
