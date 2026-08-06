"use client";

import { useTheme, type ThemePreference } from "./ThemeProvider";
import RadioCardGroup, { type RadioOption } from "./RadioCardGroup";

const options: ReadonlyArray<RadioOption<ThemePreference>> = [
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces, best in well-lit spaces.",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-glare surfaces, easier on the eyes at night.",
  },
  {
    value: "system",
    label: "System default",
    description: "Follow your device's appearance setting.",
  },
];

export default function ThemeSettings() {
  const { preference, setPreference, resolvedTheme, mounted } = useTheme();

  return (
    <RadioCardGroup
      legend="Theme"
      name="theme"
      options={options}
      value={preference}
      onChange={setPreference}
      note={
        <>
          Your choice is saved in this browser (localStorage and a cookie), so
          it persists across visits.
          {mounted && preference === "system"
            ? ` Currently following your device: ${resolvedTheme}.`
            : ""}
        </>
      }
    />
  );
}
