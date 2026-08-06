"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { FEED_LAYOUT_KEY, type FeedLayout } from "@/lib/preferences";
import RadioCardGroup, { type RadioOption } from "./RadioCardGroup";

const options: ReadonlyArray<RadioOption<FeedLayout>> = [
  {
    value: "card",
    label: "Cards",
    description: "Visual grid with category banners.",
  },
  {
    value: "list",
    label: "List",
    description: "Compact rows for faster scanning.",
  },
];

export default function LayoutSettings() {
  const [layout, setLayout] = useLocalStorage<FeedLayout>(
    FEED_LAYOUT_KEY,
    "card",
  );

  return (
    <RadioCardGroup
      legend="Feed layout"
      name="feed-layout"
      options={options}
      value={layout}
      onChange={setLayout}
      note="Applies to the Feeds page. Saved in this browser."
    />
  );
}
