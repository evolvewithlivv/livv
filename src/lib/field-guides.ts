export type FieldPillar = "grow" | "keep" | "preserve" | "store";

export type FieldGuideStep = {
  id: string;
  title: string;
  instruction: string;
  detail: string;
  checkpoint: string;
  timing?: string;
};

export type FieldGuide = {
  slug: string;
  pillar: FieldPillar;
  title: string;
  eyebrow: string;
  summary: string;
  level: "Beginner" | "Intermediate";
  duration: string;
  reviewedAt: string;
  reviewStatus: "reviewed" | "draft";
  overview: string;
  budgetEstimate: string;
  prerequisites: string[];
  supplies: { item: string; amount: string; optional?: boolean }[];
  safety: string[];
  steps: FieldGuideStep[];
  troubleshoot: { problem: string; cause: string; response: string }[];
  verification: string[];
  maintenance: string[];
  sources: { title: string; publisher: string; url: string; checked: string }[];
};

export const FIELD_GUIDES: FieldGuide[] = [
  {
    slug: "grow-leafy-greens",
    pillar: "grow",
    title: "Grow leafy greens",
    eyebrow: "Field guide 001 / Grow",
    summary: "Grow a first crop of loose-leaf lettuce in a container or small garden, then harvest it in stages.",
    level: "Beginner",
    duration: "First harvest often takes about 4–7 weeks, depending on variety and conditions.",
    reviewedAt: "2026-10-09",
    reviewStatus: "reviewed",
    overview:
      "Loose-leaf lettuce is a useful first crop because it grows in modest spaces and can often be harvested leaf by leaf. It prefers cool weather, consistent moisture, and soil that drains well. This guide is a general starting point; use the seed packet and local extension advice for the variety and climate you actually have.",
    budgetEstimate: "Rough U.S. estimate: about $10–25 if you reuse a suitable container and household tools, or $20–40 if you need to buy a container and potting mix. Seed varieties, bag sizes, and local prices vary.",
    prerequisites: [
      "A bright location that suits the chosen variety and current season.",
      "Reliable access to clean water and a way to check soil moisture.",
      "A container with drainage or a small garden bed, plus a few minutes most days to inspect the crop."
    ],
    supplies: [
      { item: "Loose-leaf lettuce seeds", amount: "1 packet" },
      { item: "Container with drainage holes or a prepared garden bed", amount: "A container about 6–8 in / 15–20 cm deep is a practical starting point" },
      { item: "Clean, good-quality potting mix for containers", amount: "Enough to fill the container; do not use garden soil in a pot" },
      { item: "Watering can or gentle spray nozzle", amount: "1" },
      { item: "Small scissors", amount: "1 pair, for thinning and harvest" },
      { item: "Plant label and pencil", amount: "Optional" },
      { item: "Balanced fertilizer", amount: "Only if the mix or soil needs it; follow the label" },
    ],
    safety: [
      "Choose a location with safe access to water and enough light. Keep containers stable and make sure excess water can drain without damaging a surface.",
      "Use potting mix as directed and wash hands after handling soil or compost. Do not use fresh manure around edible leaves.",
      "If using soil from a yard where contamination is possible, choose a clean container and food-gardening mix instead.",
      "Wash harvested leaves under clean running water before eating. Do not use soap or household disinfectant on produce.",
    ],
    steps: [
      {
        id: "choose",
        title: "Choose the right time and variety",
        instruction: "Pick a loose-leaf lettuce variety suited to your local season. Plan for cool weather, usually spring or fall in places with hot summers. Check your local frost dates and the seed packet before sowing.",
        detail: "Heat and long days can make lettuce bolt, meaning it sends up a flower stalk and often becomes bitter. If the weather is hot, choose a heat-tolerant variety or wait for cooler conditions.",
        checkpoint: "You know where the plant will grow, how much light it receives, and whether the current season suits the variety.",
        timing: "Before buying or sowing"
      },
      {
        id: "prepare",
        title: "Prepare the growing space",
        instruction: "For a container, choose one with drainage holes and fill it with fresh potting mix, leaving a little room at the top for watering. For a garden bed, loosen the surface and remove weeds; the soil should hold moisture but drain excess water.",
        detail: "Lettuce roots are relatively shallow. A container that drains is more reliable than a pot with standing water. Do not add fertilizer automatically if the mix already contains nutrients.",
        checkpoint: "The growing medium is loose, evenly moist, and able to drain.",
        timing: "10–20 minutes"
      },
      {
        id: "sow",
        title: "Sow the seeds",
        instruction: "Follow the seed packet's depth first. A common starting range for lettuce is about 1/4–1/2 inch (6–13 mm) deep. Sow lightly in a row or small patch, cover gently, and water with a fine spray so seeds are not washed away.",
        detail: "Seeds are small, so sowing too thickly makes thinning harder. If the packet gives a different depth or spacing for your variety, follow it.",
        checkpoint: "Seeds are covered at the recommended depth and the surface is moist, not flooded.",
        timing: "15–25 minutes"
      },
      {
        id: "germinate",
        title: "Keep the seedbed evenly moist",
        instruction: "Check the surface at least daily while seeds are germinating. Water gently whenever it begins to dry; do not let the mix become waterlogged. Keep the container in a bright, cool location appropriate for the variety.",
        detail: "Germination time varies with seed freshness and temperature. Use the packet's expected range rather than assuming every seed will sprout on a fixed day.",
        checkpoint: "The surface remains lightly moist and seedlings appear within the expected window on the packet.",
        timing: "Check daily; germination commonly takes about 7–14 days"
      },
      {
        id: "thin",
        title: "Thin seedlings to give them room",
        instruction: "Once seedlings are large enough to handle, thin them to the spacing recommended for your lettuce type. Full-size loose-leaf plants commonly need about 10–12 inches (25–30 cm); baby-leaf growing can be closer. Use the packet's spacing as the final guide.",
        detail: "Crowded plants compete for light and airflow. Snip unwanted seedlings at soil level rather than pulling hard and disturbing nearby roots. Small thinnings may be eaten only if grown and handled hygienically.",
        checkpoint: "Remaining plants have room to spread and air can move between them.",
        timing: "When seedlings have several true leaves"
      },
      {
        id: "water",
        title: "Water consistently and watch growth",
        instruction: "Check moisture with a finger just below the surface. Water slowly when the mix begins to dry, until excess drains from the container. Empty any saucer that holds standing water. Adjust for rain, wind, heat, container size, and plant growth.",
        detail: "Lettuce has shallow roots and can suffer when it dries out. There is no single daily watering amount that works for every pot and climate; use soil moisture and drainage as your guide.",
        checkpoint: "The root zone stays evenly moist without standing water or repeated wilting.",
        timing: "Daily moisture check"
      },
      {
        id: "maintain",
        title: "Keep the crop healthy",
        instruction: "Inspect leaves and the underside of foliage every few days. Remove weeds, look for chewing damage or sticky residue, and keep the area free of rotting leaves. If growth is pale or stalled, check light, moisture, root crowding, and the potting mix before adding fertilizer.",
        detail: "Avoid spraying pesticides on edible leaves unless the product is specifically labeled for that crop and you follow every label instruction and harvest interval. Identify the problem before treating it.",
        checkpoint: "You can describe the plant's condition and identify any issue you need to investigate.",
        timing: "Every 2–3 days"
      },
      {
        id: "harvest",
        title: "Harvest leaves without wasting the plant",
        instruction: "When outer leaves reach a usable size, use clean scissors to cut a few leaves from the outside, leaving the central growing point and most small leaves intact. Alternatively, cut the whole plant at the base when you want a single harvest.",
        detail: "Harvest before heat causes the plant to bolt where possible. Rinse leaves under clean running water and dry them with clean equipment. Refrigerate promptly in a clean container.",
        checkpoint: "Leaves are clean, sound, and harvested without damaging the remaining growing point.",
        timing: "Often around 4–7 weeks from sowing; variety and conditions change this"
      },
      {
        id: "next-sowing",
        title: "Plan the next sowing",
        instruction: "Record the sowing date, variety, germination, and first harvest. If the season remains suitable, sow a small new batch every 1–2 weeks for a more continuous supply. Stop or change varieties when local temperatures become unsuitable.",
        detail: "Succession sowing spreads the harvest instead of leaving all plants ready at once. Do not save seed from a hybrid variety expecting identical plants next season; check the variety information first.",
        checkpoint: "Your notes identify what worked and when you would sow the next batch.",
        timing: "After the first successful harvest"
      }
    ],
    troubleshoot: [
      {
        problem: "Seeds do not sprout",
        cause: "The seedbed dried out, seeds were buried too deeply, seed is old, or conditions are too warm or cold.",
        response: "Check the packet's germination range and depth. Keep the surface evenly moist, not saturated. If the expected germination window has passed, sow a small fresh batch."
      },
      {
        problem: "Seedlings are long, thin, and leaning",
        cause: "They are not receiving enough light or are too crowded.",
        response: "Move containers to a brighter suitable location and thin seedlings to the recommended spacing. Avoid sudden exposure to harsh conditions."
      },
      {
        problem: "Leaves wilt even though the pot was watered",
        cause: "The root zone may be too dry, the container may drain poorly, or heat may be stressing the plant.",
        response: "Check moisture below the surface and confirm drainage holes are open. Protect plants from excessive heat and reassess watering based on actual conditions."
      },
      {
        problem: "Leaves become bitter or a flower stalk appears",
        cause: "The plant is bolting, often in response to heat or long days.",
        response: "Harvest usable leaves promptly, then plan the next sowing for a cooler window or choose a variety described as slow to bolt."
      },
      {
        problem: "Leaves have holes, spots, or unusual discoloration",
        cause: "Possible insects, disease, watering stress, or physical damage.",
        response: "Inspect both sides of leaves and compare symptoms with a reliable local extension guide. Remove badly damaged material and identify the cause before using any treatment."
      }
    ],
    verification: [
      "I selected a variety and sowing window appropriate for my local conditions.",
      "I prepared a draining growing space and sowed at the packet's recommended depth.",
      "I can check and adjust moisture without keeping the roots waterlogged.",
      "I can identify when to thin seedlings and when to harvest outer leaves.",
      "I recorded the variety, dates, results, and what I would change next time."
    ],
    maintenance: [
      "Check moisture daily and adjust for weather and container size.",
      "Inspect foliage every few days for pests, damage, and bolting.",
      "Harvest clean leaves as needed and refrigerate promptly.",
      "Record results and plan the next sowing only while conditions suit the crop."
    ],
    sources: [
      {
        title: "Growing lettuce, endive and radicchio in home gardens",
        publisher: "University of Minnesota Extension",
        url: "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-lettuce-endive-and-radicchio",
        checked: "2026-10-09"
      },
      {
        title: "Philadelphia Planting Guide",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/programs/master-gardener/counties/philadelphia/resources/philadelphia-planting-guide",
        checked: "2026-10-09"
      },
      {
        title: "Cool-season vs. warm-season vegetables",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/cool-season-vs-warm-season-vegetables",
        checked: "2026-10-09"
      }
    ]
  }
];

export function getFieldGuide(slug: string) {
  return FIELD_GUIDES.find((guide) => guide.slug === slug);
}
