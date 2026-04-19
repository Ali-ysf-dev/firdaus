import React from "react";

export const featureSections = [
  {
    id: "surface",
    label: "Chapter 01 · Surface",
    title: (
      <>
        Where the display
        <br />
        <span className="text-zinc-500">meets the carpet.</span>
      </>
    ),
    description:
      "The interface sits flush on a sculpted foam base. Scroll slows down so you can read how the glass, bezel, and soft landing work together—one continuous story of material and light.",
    contentOnLeft: true,
    features: [
      {
        title: "Precision-tuned interface",
        description: "The face is framed so typography and touch targets stay legible from every angle you see in the scroll.",
      },
      {
        title: "Soft transition to foam",
        description: "No hard cliff between display and pad: the carpet eases the eye from screen to support.",
      },
    ],
  },
  {
    id: "foundation",
    label: "Chapter 02 · Foundation",
    title: (
      <>
        The carpet
        <br />
        <span className="text-zinc-500">has depth.</span>
      </>
    ),
    description:
      "The foam isn’t decoration—it’s structure. Density, edge radius, and thickness are tuned so the product feels planted but still light. The camera swings to profile so you can read that mass.",
    contentOnLeft: false,
    features: [
      {
        title: "Engineered thickness",
        description: "Enough material to absorb vibration and feel premium in the hand, without bulk.",
      },
      {
        title: "Stable footprint",
        description: "The pad’s contact patch keeps the assembly steady on desk, tray, or nightstand.",
      },
      {
        title: "Made to last",
        description: "Foam formulation and skin texture chosen for daily wear and easy cleaning.",
      },
    ],
  },
  {
    id: "presence",
    label: "Chapter 03 · Presence",
    title: (
      <>
        The full
        <br />
        <span className="text-zinc-500">Firdaus object.</span>
      </>
    ),
    description:
      "Pull back to the same wide language as the opening: the whole carpet and display in one frame. This is how Firdaus wants the piece remembered—balanced, calm, complete.",
    contentOnLeft: true,
    features: [],
  },
];
