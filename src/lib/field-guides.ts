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
        title: "Starting Your Summer Vegetable Garden: Seeds or Transplants?",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/starting-your-summer-vegetable-garden-seeds-or-transplants",
        checked: "2026-10-09"
      },
      {
        title: "Cool-season vs. warm-season vegetables",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/cool-season-vs-warm-season-vegetables",
        checked: "2026-10-09"
      }
    ]
  },

  {
    slug: "keep-compost",
    pillar: "keep",
    title: "Build a home compost pile",
    eyebrow: "Field guide 002 / Keep",
    summary: "Turn suitable kitchen scraps and yard material into finished compost with a simple, manageable routine.",
    level: "Beginner",
    duration: "A monitored pile commonly takes about 3 to 4 months; weather and materials change the timeline.",
    reviewedAt: "2026-10-09",
    reviewStatus: "reviewed",
    overview: "Composting is controlled decomposition. A workable pile needs a mix of carbon-rich brown materials, nitrogen-rich green materials, moisture, and air. The goal is not to make the pile complicated. It is to give decomposers a balanced place to work, then wait until the material is stable before using it.",
    budgetEstimate: "Rough U.S. estimate: $0 to $25 if you reuse a bin or make a simple enclosure from suitable materials. A purchased bin or tools can cost more.",
    prerequisites: [
      "A spot with safe access and room for a stable pile or ventilated bin.",
      "A way to collect brown yard material and suitable green scraps.",
      "Enough time to check moisture and turn the pile during the first few weeks."
    ],
    supplies: [
      { item: "Ventilated compost bin or contained pile", amount: "1" },
      { item: "Brown material", amount: "Dry leaves, untreated shredded cardboard, or straw" },
      { item: "Green material", amount: "Fruit and vegetable scraps, fresh plant trimmings, or grass clippings" },
      { item: "Water", amount: "Enough to keep the pile damp, not soaked" },
      { item: "Garden fork or compost aerator", amount: "1; a tool that safely turns the pile" },
      { item: "Gloves and a small collection container", amount: "Optional but useful" }
    ],
    safety: [
      "Do not add human waste, pet waste, or cat litter to a home compost pile. Check local rules before composting animal manure.",
      "For a simple backyard pile, keep out meat, fish, dairy, fats, and oily food scraps because they can attract pests and create odor.",
      "Wear gloves when handling decomposing material, wash hands afterward, and keep the bin secured from pets and wildlife.",
      "Do not use unfinished compost around seedlings or edible roots. Let the material finish breaking down first."
    ],
    steps: [
      {
        id: "site",
        title: "Choose a safe, practical location",
        instruction: "Place the bin or pile on stable ground with room to work around it. Choose a location with convenient access to yard material and water. Check local rules if you rent, live in a managed community, or plan to compost manure.",
        detail: "A site that is easy to reach is more likely to be maintained. Keep the pile contained so loose material does not spread into paths, drains, or neighboring property.",
        checkpoint: "The pile is stable, accessible, and allowed in the chosen location.",
        timing: "10 to 20 minutes"
      },
      {
        id: "sort",
        title: "Separate browns from greens",
        instruction: "Collect dry leaves, untreated shredded cardboard, or straw as browns. Collect fruit and vegetable scraps, fresh plant trimmings, and grass clippings as greens. Break bulky pieces into smaller pieces so they mix and decompose more evenly.",
        detail: "Browns supply carbon-rich material; greens supply more nitrogen. If the pile is mostly one type, it may decompose slowly or develop odors. Avoid treated wood, pet waste, meat, dairy, and oily scraps in a basic backyard pile.",
        checkpoint: "You have a loose supply of both dry brown material and fresh green material.",
        timing: "15 to 30 minutes"
      },
      {
        id: "layer",
        title: "Build a mixed pile",
        instruction: "Start with a layer of brown material, add a thinner layer of green material, and continue alternating. Mix the layers loosely rather than packing them tightly. Penn State Extension describes one practical starting pattern as about 6 inches of browns followed by 2 inches of greens, with a thin soil layer if desired.",
        detail: "The exact ratio does not need to be perfect on day one. Keep enough browns available to cover fresh scraps and help prevent odors. Do not compact the pile.",
        checkpoint: "Greens are mixed through the pile and covered with brown material.",
        timing: "20 to 40 minutes"
      },
      {
        id: "moisture",
        title: "Set the moisture level",
        instruction: "Squeeze a handful of material with a gloved hand. It should feel damp like a wrung-out sponge, not drip steadily. Add water a little at a time if dry. Add dry browns and improve drainage if waterlogged.",
        detail: "Microorganisms need moisture, but a saturated pile loses air and can become smelly. Rain, hot weather, and the type of bin change how often you need to adjust moisture.",
        checkpoint: "The pile is evenly damp without standing water or a strong rotten smell.",
        timing: "5 to 10 minutes"
      },
      {
        id: "air",
        title: "Turn the pile to bring in air",
        instruction: "Use a garden fork or aerator to loosen and turn the material. Turn it frequently during the first 3 to 4 weeks, then once or twice during the remainder of the process. Add water or browns as needed while turning.",
        detail: "Turning moves material from the outside toward the center and creates air spaces. Work at a comfortable pace and use a tool that lets you turn the pile without straining your back.",
        checkpoint: "The material is loosened, and compacted or dry sections have been mixed back in.",
        timing: "Every few days during the first 3 to 4 weeks"
      },
      {
        id: "inspect",
        title: "Inspect moisture, airflow, and smell",
        instruction: "Check the pile at least weekly. If it smells rotten or becomes slimy, mix in dry browns and turn it. If it is dry and inactive, add a little water while mixing. If it is simply decomposing slowly, check whether it is too dry, too compact, or mostly browns.",
        detail: "A compost pile does not need to be handled every day. Small, consistent adjustments are more useful than adding random products or large amounts of fertilizer.",
        checkpoint: "You can identify whether the pile needs more air, moisture, or brown material.",
        timing: "5 to 10 minutes each week"
      },
      {
        id: "wait",
        title: "Let the material finish decomposing",
        instruction: "Continue checking and turning the pile as needed. A well-managed pile commonly takes about 3 to 4 months, but colder weather, large pieces, or an imbalanced mix can make it take longer. Do not use a calendar date alone to decide it is finished.",
        detail: "The pile may slow down in cold weather. That is normal. Keep adding suitable material to a separate active pile if you want to continue collecting scraps while the first batch finishes.",
        checkpoint: "The pile has cooled and the original materials are no longer easily recognizable.",
        timing: "Often 3 to 4 months"
      },
      {
        id: "finish",
        title: "Check that the compost is ready",
        instruction: "Look for dark brown material that crumbles, smells earthy, and is no longer hot in the center. If it is still hot, smells strongly, or contains many recognizable scraps, let it continue decomposing and check again later.",
        detail: "Some small wood pieces can remain. Screen them out if you need a finer texture and return the unfinished pieces to the active pile.",
        checkpoint: "The finished material is cool, crumbly, and earthy-smelling rather than rotten or hot.",
        timing: "Before using the compost"
      },
      {
        id: "use",
        title: "Use finished compost thoughtfully",
        instruction: "Use mature compost as a soil amendment or mulch. If you plan to use a large amount, test your soil or contact your local extension office for guidance on nutrient balance and application rate. Keep unfinished material away from seedlings and edible roots.",
        detail: "Compost improves soil organic matter, but it is not a universal replacement for soil testing or crop-specific nutrient needs. Keep a short note of where you applied it and how plants responded.",
        checkpoint: "You know where the compost was applied and what you would adjust in the next batch.",
        timing: "After the pile is finished"
      }
    ],
    troubleshoot: [
      {
        problem: "The pile smells rotten",
        cause: "It may be too wet, compacted, or short on air; too many food scraps can also contribute.",
        response: "Mix in dry browns, loosen the pile, and cover exposed food scraps. Avoid adding more water until the moisture level is corrected."
      },
      {
        problem: "The pile is dry and barely changing",
        cause: "There may not be enough moisture, green material, or small pieces to support active decomposition.",
        response: "Add water gradually while turning, mix in suitable greens, and break up large pieces. Keep the pile damp rather than soaked."
      },
      {
        problem: "Animals are digging through the pile",
        cause: "Food scraps may be exposed or the enclosure may not be secure.",
        response: "Cover scraps with browns, keep meat and dairy out of a basic backyard pile, and use a secure lid or enclosure."
      },
      {
        problem: "The pile is not finished after several months",
        cause: "Cold weather, large pieces, low moisture, poor airflow, or an unbalanced mix can slow decomposition.",
        response: "Check moisture and texture, turn the material, add browns or greens if needed, and give it more time. Do not use unfinished compost just because the expected date has passed."
      }
    ],
    verification: [
      "I can name suitable brown and green materials and identify what should stay out of a basic backyard pile.",
      "I can keep the pile damp without making it waterlogged.",
      "I can turn the pile safely and identify when it needs more air or dry material.",
      "I can recognize finished compost by its temperature, texture, and smell.",
      "I recorded when the pile started and what I changed during maintenance."
    ],
    maintenance: [
      "Check moisture and odor weekly and turn the pile when it compacts.",
      "Cover fresh scraps with browns and keep the enclosure secure.",
      "Let unfinished material continue decomposing before using it around plants.",
      "Keep a simple record of start date, turning, and when finished compost was used."
    ],
    sources: [
      {
        title: "Home Composting: A Guide for Home Gardeners",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/home-composting-a-guide-for-home-gardeners",
        checked: "2026-10-09"
      }
    ]
  },
  {
    slug: "preserve-green-beans",
    pillar: "preserve",
    title: "Freeze green beans safely",
    eyebrow: "Field guide 003 / Preserve",
    summary: "Prepare, blanch, cool, package, label, and freeze green beans using tested home-freezing guidance.",
    level: "Beginner",
    duration: "About 45 to 90 minutes for a small batch, plus freezing time.",
    reviewedAt: "2026-10-09",
    reviewStatus: "reviewed",
    overview: "Freezing is convenient, but it does not sterilize food. For green beans, the National Center for Home Food Preservation recommends washing and trimming the pods, water blanching for 3 minutes, cooling promptly, draining, packaging with 1/2 inch of headspace, sealing, and freezing. Do not substitute a guessed blanching time for the tested directions.",
    budgetEstimate: "Rough U.S. estimate: $5 to $20 if you already own a pot and have freezer space. The cost depends on the beans, packaging, and equipment you need.",
    prerequisites: [
      "A working freezer with enough space for the batch.",
      "Clean drinking water, a large pot with a lid, and a way to lift beans safely from boiling water.",
      "Freezer-safe containers or bags, labels, and a timer."
    ],
    supplies: [
      { item: "Young, tender green beans", amount: "A manageable batch that leaves room for water to return to a boil" },
      { item: "Large pot with lid and blanching basket", amount: "Use enough water for the batch; NCHFP recommends about 1 gallon per pound of vegetables" },
      { item: "Large bowl of cold water or ice water", amount: "Enough to cool the beans quickly" },
      { item: "Clean colander", amount: "1" },
      { item: "Freezer-safe bags or rigid containers", amount: "Enough for small usable portions" },
      { item: "Labels and marker", amount: "Record food name and freezing date" }
    ],
    safety: [
      "Wash hands, work surfaces, and equipment before handling produce. Use clean drinking water.",
      "Boiling water can cause serious burns. Use a stable pot, keep handles turned inward, and lift the basket slowly with suitable tools.",
      "Use the tested 3-minute water-blanching time for green beans. Underblanching can reduce quality; do not guess or shorten the time.",
      "Freezing slows microbial growth but does not sterilize food. Keep beans frozen and discard food if contamination or unsafe temperature exposure is suspected."
    ],
    steps: [
      {
        id: "choose",
        title: "Select and sort the beans",
        instruction: "Choose young, tender pods with seeds just forming. Discard pods that are moldy, slimy, badly damaged, or decaying. Sort the remaining beans by size if they vary greatly.",
        detail: "Quality before freezing affects quality after thawing. Do not try to rescue spoiled produce by blanching or freezing it.",
        checkpoint: "The batch contains sound, tender beans rather than damaged or spoiled pods.",
        timing: "5 to 10 minutes"
      },
      {
        id: "wash",
        title: "Wash, trim, and cut",
        instruction: "Rinse the beans in cold drinking water, remove the stem ends, and cut into pieces about 2 to 4 inches long if desired. Keep the pieces similar in size so they heat evenly.",
        detail: "Use a clean cutting board and knife. Prepare only as much as you can blanch and cool promptly.",
        checkpoint: "Beans are clean, trimmed, and cut to a consistent size.",
        timing: "10 to 20 minutes"
      },
      {
        id: "prepare-water",
        title: "Prepare enough boiling water",
        instruction: "Bring a large pot of water to a vigorous boil with a lid. For home freezing, NCHFP recommends about 1 gallon of water per pound of prepared vegetables. Work in small batches so the water returns to a boil quickly.",
        detail: "If the water does not return to a boil within about 1 minute after adding the beans, the batch is too large for the amount of water. Remove some beans or use a smaller batch next time.",
        checkpoint: "The water is at a vigorous boil and the batch size will not overwhelm the pot.",
        timing: "10 to 15 minutes"
      },
      {
        id: "blanch",
        title: "Water-blanch for exactly 3 minutes",
        instruction: "Place the beans in a blanching basket, lower them into the boiling water, cover the pot, and keep the heat high. Start the 3-minute timer when the water returns to a boil. Follow the tested time for green beans rather than estimating by appearance.",
        detail: "Blanching slows enzyme activity that can damage flavor, color, and texture during frozen storage. Keep the batch small enough that the water returns to boiling within about 1 minute.",
        checkpoint: "The full 3-minute blanching time is completed.",
        timing: "3 minutes after the water returns to a boil"
      },
      {
        id: "cool",
        title: "Cool immediately and drain",
        instruction: "As soon as blanching is complete, transfer the beans to a large amount of cold water or ice water. Cool them promptly for about the same length of time as the blanching step, changing the water as it warms. Drain thoroughly.",
        detail: "NCHFP recommends cooling water at 60°F or below. Thorough draining helps reduce excess ice and protect quality.",
        checkpoint: "The beans are cooled through and excess water has drained away.",
        timing: "At least 3 minutes, then drain well"
      },
      {
        id: "package",
        title: "Pack in freezer-safe containers",
        instruction: "Divide beans into portions you will use at one time. Pack into freezer-safe bags or rigid containers, leaving about 1/2 inch of headspace for green beans in rigid containers. Remove excess air from bags, seal, and label with the food name and date.",
        detail: "Use packaging designed for freezing. A clear label helps you rotate supplies and avoid mystery packages later.",
        checkpoint: "Each package is sealed, labeled, and sized for a practical meal.",
        timing: "10 to 20 minutes"
      },
      {
        id: "freeze",
        title: "Freeze promptly",
        instruction: "Place packages in the freezer promptly at 0°F or below, leaving room for cold air to circulate around the batch until frozen. Once solid, organize them together so older packages are easy to use first.",
        detail: "Do not leave prepared beans sitting at room temperature while you finish other chores. If your freezer has a specific loading or quick-freeze setting, follow its manual.",
        checkpoint: "Packages are in the freezer and the date is recorded.",
        timing: "Immediately after packing"
      },
      {
        id: "record",
        title: "Record the batch and rotate it",
        instruction: "Write down the amount frozen, the date, and anything you would change next time. Use older packages first and follow freezer guidance for safe storage and thawing.",
        detail: "Freezing is a preservation method, not a way to make spoiled food safe. Keep the freezer closed during outages and follow official guidance if food thaws.",
        checkpoint: "You can identify the batch and know which packages should be used first.",
        timing: "2 minutes"
      }
    ],
    troubleshoot: [
      {
        problem: "The water takes too long to return to a boil",
        cause: "The batch is too large for the amount of boiling water or the pot is too small.",
        response: "Reduce the batch size and use the recommended water amount. Restart the process for a manageable batch rather than guessing a new blanching time."
      },
      {
        problem: "Packages have a lot of ice crystals",
        cause: "Beans may not have drained well, packaging may leak, or temperature may fluctuate.",
        response: "Drain thoroughly, use freezer-safe packaging, remove excess air from bags, and keep the freezer temperature stable."
      },
      {
        problem: "Beans become soft after thawing",
        cause: "Overcooking, poor cooling, or freezing quality can affect texture.",
        response: "Follow the tested blanching and cooling times, drain well, and choose tender fresh beans. Frozen beans are often best used in cooked dishes."
      },
      {
        problem: "A package was left thawed for an unknown time",
        cause: "The temperature history is uncertain.",
        response: "Do not taste-test to decide whether it is safe. Follow USDA food-safety guidance for freezer outages and discard food when safety is uncertain."
      }
    ],
    verification: [
      "I selected sound beans and prepared clean equipment.",
      "I can explain why blanching is required and why the tested time matters.",
      "I completed the 3-minute water blanch and cooled the beans promptly.",
      "I packaged the beans with the recommended headspace, sealed, labeled, and froze them promptly.",
      "I recorded the batch date and know to rotate older packages first."
    ],
    maintenance: [
      "Keep frozen packages sealed and clearly labeled.",
      "Use older packages first and avoid repeated temperature changes.",
      "Follow current food-safety guidance after a freezer outage or unexpected thaw.",
      "Use tested, food-specific directions for every other vegetable; do not assume blanching times are interchangeable."
    ],
    sources: [
      {
        title: "Freezing Beans: Green, Snap, or Wax",
        publisher: "National Center for Home Food Preservation, University of Georgia",
        url: "https://nchfp.uga.edu/how/freeze/vegetable/freezing-beans-green-snap-or-wax/",
        checked: "2026-10-09"
      },
      {
        title: "Blanching Vegetables",
        publisher: "National Center for Home Food Preservation, University of Georgia",
        url: "https://nchfp.uga.edu/how/freeze/freeze-general-information/blanching-vegetables/",
        checked: "2026-10-09"
      },
      {
        title: "Freezing Pointers",
        publisher: "National Center for Home Food Preservation, University of Georgia",
        url: "https://nchfp.uga.edu/how/freeze/freeze-general-information/freezing-pointers/",
        checked: "2026-10-09"
      },
      {
        title: "Food Safety During Power Outage",
        publisher: "FoodSafety.gov",
        url: "https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage",
        checked: "2026-10-09"
      }
    ]
  },
  {
    slug: "store-emergency-water",
    pillar: "store",
    title: "Build an emergency water reserve",
    eyebrow: "Field guide 004 / Store",
    summary: "Calculate a household baseline, choose safe containers, label stored water, and keep it ready for an interruption.",
    level: "Beginner",
    duration: "About 30 to 60 minutes to calculate, organize, and label an initial reserve.",
    reviewedAt: "2026-10-09",
    reviewStatus: "reviewed",
    overview: "Safe drinking water may not be available during a water-related emergency. CDC recommends storing at least 1 gallon per person per day for at least 3 days and suggests aiming for 2 weeks if possible. This guide covers storage planning and rotation, not a substitute for local emergency instructions or a complete water-treatment procedure.",
    budgetEstimate: "Cost depends on household size and whether you use unopened commercial bottled water or buy food-grade storage containers. Calculate the required volume before purchasing supplies.",
    prerequisites: [
      "A current count of household members and any pets that need stored water.",
      "A clean, cool storage area away from direct sunlight and toxic substances.",
      "A way to label containers and track replacement dates."
    ],
    supplies: [
      { item: "Unopened commercial bottled water or food-grade water containers", amount: "Enough to meet your calculated target" },
      { item: "Labels and permanent marker", amount: "Record contents and date stored" },
      { item: "Measuring jug or calculator", amount: "Calculate the required gallons" },
      { item: "Soap and clean water", amount: "For cleaning containers if you are filling your own" },
      { item: "Unscented household chlorine bleach", amount: "Only if needed for container sanitation; follow CDC guidance and the product label" }
    ],
    safety: [
      "Unopened commercially bottled water is CDC's safest and most reliable emergency source. Observe the bottle's expiration date.",
      "Use FDA-approved food-grade water containers when filling your own. Never use a container that previously held fuel, pesticides, bleach, or other toxic chemicals.",
      "Store water cool, ideally around 50°F to 70°F, away from sunlight and chemicals. Label containers and replace self-filled water every 6 months.",
      "Water contaminated with fuel, toxic chemicals, or radioactive material cannot be made safe by boiling or disinfecting. Use a different safe source and follow local health officials.",
      "During an actual emergency, follow local authorities' instructions for boil-water advisories, contamination, and treatment. This guide is about storage, not improvising treatment."
    ],
    steps: [
      {
        id: "count",
        title: "Count everyone the reserve must support",
        instruction: "Write down the number of people in the household and identify pets or special circumstances that may require extra water. Do not calculate only for the adults who usually buy groceries.",
        detail: "CDC advises considering more water for people who are pregnant or sick, for pets, and in hot climates. Local emergency guidance may call for additional amounts.",
        checkpoint: "You have a realistic household count and noted any reasons to store extra water.",
        timing: "5 minutes"
      },
      {
        id: "calculate",
        title: "Calculate a three-day baseline",
        instruction: "Multiply the number of people by 1 gallon per person per day, then multiply by 3 days. For example, 2 people need at least 6 gallons for the CDC's three-day baseline, before adding extra for pets or special needs.",
        detail: "CDC recommends trying to store a two-week supply if possible. Start with a baseline you can manage, then plan how to build toward a larger reserve if space and budget allow.",
        checkpoint: "You recorded the minimum gallons for three days and a longer-term target if feasible.",
        timing: "5 minutes"
      },
      {
        id: "choose",
        title: "Choose safe water and containers",
        instruction: "Use unopened commercial bottled water when possible. If you fill containers yourself, choose FDA-approved food-grade water storage containers with tight-fitting lids. If food-grade containers are unavailable, use durable, unbreakable containers with a secure closure and a narrow opening where possible.",
        detail: "Never store drinking water in a container that held toxic chemicals. Glass can break and create a hazard, so CDC recommends durable, unbreakable storage containers.",
        checkpoint: "Every container is suitable for drinking water and can be closed securely.",
        timing: "10 minutes"
      },
      {
        id: "clean",
        title: "Clean and sanitize containers you will fill",
        instruction: "Wash the container with soap and rinse it completely. CDC's container-sanitizing method uses 1 teaspoon of unscented household bleach containing 5% to 9% sodium hypochlorite mixed with 1 quart of water. Cover and shake so the solution touches all inside surfaces, wait at least 30 seconds, pour it out, and let the container air-dry before filling.",
        detail: "This mixture is for sanitizing an empty container, not for treating drinking water. Do not confuse container sanitation with CDC's separate instructions for disinfecting unsafe water. Follow current CDC guidance and the bleach label.",
        checkpoint: "The container was cleaned, sanitized, air-dried, and is ready for safe water.",
        timing: "10 to 20 minutes plus air-drying"
      },
      {
        id: "fill",
        title: "Fill, seal, and label",
        instruction: "Fill the sanitized container with safe drinking water and close the lid tightly. Label it as drinking water and write the date stored. Keep containers small enough that household members can move them safely.",
        detail: "Do not touch the water or the inside of the lid with your hands. If using a scoop or another device later, keep it clean and avoid contaminating the stored supply.",
        checkpoint: "Each container is sealed, labeled, and has a clear storage date.",
        timing: "5 to 10 minutes"
      },
      {
        id: "store",
        title: "Store the reserve correctly",
        instruction: "Place containers in a cool location, ideally 50°F to 70°F, away from direct sunlight, gasoline, pesticides, cleaning chemicals, and other contaminants. Keep the containers accessible but protected from damage.",
        detail: "A reserve that is hidden behind heavy items or stored where containers may crack is harder to use when needed. Keep the storage location known to the household.",
        checkpoint: "The reserve is protected, accessible, and away from heat, sunlight, and chemicals.",
        timing: "5 minutes"
      },
      {
        id: "rotate",
        title: "Set a rotation reminder",
        instruction: "For water you filled yourself, set a reminder to replace it every 6 months. For commercially bottled water, follow the date on the bottle. Inspect containers when rotating them and replace any that leak, are damaged, or have questionable contents.",
        detail: "Keep the storage date visible. A written inventory or calendar reminder is more reliable than trying to remember when containers were filled.",
        checkpoint: "You have a clear next replacement date and know which containers need rotation.",
        timing: "2 minutes"
      },
      {
        id: "emergency",
        title: "Know what to do if water becomes unsafe",
        instruction: "Save CDC's current emergency water guidance and local water-authority contact details. During an incident, follow the instructions for your area. Do not assume stored tap water is safe if the container was contaminated or damaged.",
        detail: "Boiling or disinfecting can address many germs but cannot make water containing fuel or toxic chemicals safe. Use bottled water or another safe source if chemical contamination is suspected.",
        checkpoint: "You know where to find official instructions and understand when stored or untreated water should not be used.",
        timing: "5 minutes"
      }
    ],
    troubleshoot: [
      {
        problem: "There is not enough space for the calculated reserve",
        cause: "The full supply is larger than the available storage area.",
        response: "Start with the CDC three-day baseline, use suitable smaller containers, identify a safe additional storage location, and work toward a longer supply as space and budget allow. Do not place containers where they create a fall or lifting hazard."
      },
      {
        problem: "You do not know when water was stored",
        cause: "The container was not labeled or the label has come off.",
        response: "Do not guess the date. Replace the supply with safe water, label the new date, and add it to your rotation record."
      },
      {
        problem: "A container is cracked, leaking, or has an unusual appearance",
        cause: "The container may have been damaged or the water may have been contaminated.",
        response: "Do not drink water from a questionable container. Replace it with a known safe supply and inspect the storage area for the cause."
      },
      {
        problem: "Authorities warn that tap water may be contaminated",
        cause: "The water may contain germs or chemical hazards.",
        response: "Follow local health officials. Use bottled or otherwise officially approved safe water. Water contaminated with fuel or toxic chemicals cannot be made safe by boiling or disinfecting."
      }
    ],
    verification: [
      "I calculated at least 1 gallon per person per day for a three-day baseline and considered special needs.",
      "I selected containers suitable for drinking water and avoided containers that held toxic chemicals.",
      "I know the difference between sanitizing an empty container and treating unsafe drinking water.",
      "I labeled the stored water and set a replacement reminder.",
      "I saved official CDC and local water-authority instructions for an actual emergency."
    ],
    maintenance: [
      "Replace self-filled water every 6 months and follow the date on commercial bottled water.",
      "Inspect containers for leaks, damage, and labels during each rotation.",
      "Keep the reserve cool, out of sunlight, and away from toxic substances.",
      "Review household needs and increase the supply when space and budget allow.",
      "During an emergency, follow current CDC and local health-authority guidance."
    ],
    sources: [
      {
        title: "How to Create an Emergency Water Supply",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html",
        checked: "2026-10-09"
      },
      {
        title: "How to Make Water Safe in an Emergency",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/water-emergency/about/",
        checked: "2026-10-09"
      }
    ]
  },
  {
    "slug": "grow-beans",
    "pillar": "grow",
    "title": "Grow snap beans",
    "eyebrow": "Field guide 005 / Grow",
    "summary": "Choose bush or pole beans, sow at the right time, manage water and support, and harvest a useful crop.",
    "level": "Beginner",
    "duration": "Often 50–70 days from sowing, depending on variety and conditions.",
    "reviewedAt": "2026-10-09",
    "reviewStatus": "reviewed",
    "overview": "Snap beans are a productive warm-season crop. Bush varieties stay more compact and usually crop over a shorter period; pole varieties climb and often produce over a longer window. This guide focuses on harvesting tender green pods for eating fresh or freezing. Growing dry beans for storage requires a different harvest and drying plan.",
    "budgetEstimate": "Rough U.S. estimate: $5–20 if you already have soil or a container; more if you need a large planter, trellis, or new growing mix.",
    "prerequisites": [
      "A location with roughly 6–8 hours of direct sun during the growing season.",
      "Soil or potting mix that drains well and access to clean water.",
      "A warm-season window after local frost danger has passed."
    ],
    "supplies": [
      {
        "item": "Snap bean seeds",
        "amount": "1 packet"
      },
      {
        "item": "Prepared bed or large container with drainage",
        "amount": "Enough room for the spacing on the packet"
      },
      {
        "item": "Trellis or sturdy support",
        "amount": "For pole beans; optional for bush types"
      },
      {
        "item": "Watering can or hose with gentle flow",
        "amount": "1"
      },
      {
        "item": "Clean harvest basket or container",
        "amount": "1"
      },
      {
        "item": "Mulch",
        "amount": "Optional, to reduce moisture swings"
      }
    ],
    "safety": [
      "Do not sow beans into cold, waterlogged soil; seeds may rot. Follow the packet and local planting guidance.",
      "Use only products labeled for edible beans and follow every label direction, including pre-harvest intervals.",
      "Wash hands and harvested pods; refrigerate fresh beans promptly if not using them soon.",
      "Do not eat raw dried beans. If growing dry beans, use a trusted food-safety source for proper preparation."
    ],
    "steps": [
      {
        "id": "variety",
        "title": "Choose bush or pole beans",
        "instruction": "Choose a snap-bean variety suited to your climate and the space available. Bush beans need less structure and tend to mature in a concentrated window. Pole beans need a stable trellis and can keep producing as you pick.",
        "detail": "Check days to maturity, disease-resistance notes, pod type, and the packet's spacing. If you have limited space, a container-friendly bush variety may be simplest.",
        "checkpoint": "You know the variety, its mature size, and whether it needs support.",
        "timing": "Before purchasing"
      },
      {
        "id": "site",
        "title": "Wait for warm soil and prepare the bed",
        "instruction": "Sow after frost danger has passed and the soil has warmed. Choose full sun and loosen the soil so water drains instead of pooling. For containers, use a sufficiently large pot with drainage and fresh potting mix.",
        "detail": "Beans generally perform poorly in cold, wet soil. Do not add fertilizer automatically; too much nitrogen can encourage leafy growth at the expense of pods.",
        "checkpoint": "The site is sunny, warm, and drains well.",
        "timing": "Before sowing"
      },
      {
        "id": "sow",
        "title": "Sow directly at packet spacing",
        "instruction": "Plant seeds directly where they will grow, at the depth and spacing printed on the packet. Water gently after sowing and label the row or container with the variety and date.",
        "detail": "Beans usually do not need to be started indoors. Avoid soaking the seedbed; maintain even moisture while seedlings emerge.",
        "checkpoint": "Seeds are at the recommended depth and the soil is moist, not saturated.",
        "timing": "About 15–30 minutes"
      },
      {
        "id": "support",
        "title": "Set support before vines tangle",
        "instruction": "For pole beans, install a sturdy trellis before vines become large. Anchor it securely and keep it clear of paths. Bush beans normally do not need a trellis.",
        "detail": "Adding support early avoids damaging roots and stems later. Do not rely on a light stake that can fall in wind or under the weight of wet vines.",
        "checkpoint": "Pole beans have a stable climbing structure; bush beans have room to spread.",
        "timing": "At sowing or shortly after emergence"
      },
      {
        "id": "water",
        "title": "Water the root zone consistently",
        "instruction": "Check soil moisture regularly, especially during flowering and pod formation. Water the soil rather than repeatedly wetting foliage, and adjust for rainfall, heat, wind, and container size.",
        "detail": "Large moisture swings can reduce pod quality. Avoid frequent shallow watering if it leaves the deeper root zone dry, but never leave roots standing in water.",
        "checkpoint": "The root zone stays evenly moist without prolonged waterlogging.",
        "timing": "Check daily in hot or dry weather"
      },
      {
        "id": "inspect",
        "title": "Inspect plants and avoid unnecessary treatments",
        "instruction": "Look at the undersides of leaves and young pods for holes, spots, webbing, or clusters of insects. Identify the issue with a local extension resource before deciding whether any treatment is needed.",
        "detail": "Rotate bean crops to a different bed in following seasons when practical. Remove diseased plant material appropriately and keep weeds from competing with young plants.",
        "checkpoint": "You can describe any damage and have a reliable identification before treating.",
        "timing": "Every few days"
      },
      {
        "id": "harvest",
        "title": "Pick pods while they are tender",
        "instruction": "Harvest when pods reach the variety's expected size and seeds inside are still small. Use two hands to avoid pulling vines from their supports, and pick regularly to encourage continued production.",
        "detail": "Harvest timing varies by variety. Remove overmature pods if you want the plant to continue producing snap beans. Keep harvested pods cool and use or preserve them promptly.",
        "checkpoint": "Pods are firm and tender, and harvesting has not damaged the plant.",
        "timing": "Often 50–70 days from sowing"
      },
      {
        "id": "record",
        "title": "Review the crop and plan the next round",
        "instruction": "Record variety, sowing date, first harvest, yield, pest issues, and watering changes. If the local season is long enough, use the packet and extension recommendations to decide whether another sowing is worthwhile.",
        "detail": "Do not assume a second sowing will mature before frost. Compare the variety's days to maturity with the remaining local growing window.",
        "checkpoint": "Your notes tell you what worked and whether there is time for another crop.",
        "timing": "After the first harvest"
      }
    ],
    "troubleshoot": [
      {
        "problem": "Seeds rot or fail to emerge",
        "cause": "Soil was cold or saturated, seeds were planted too deeply, or seed viability was poor.",
        "response": "Check soil temperature guidance, drainage, and packet depth. Wait for warmer, workable soil before re-sowing."
      },
      {
        "problem": "Many leaves but few pods",
        "cause": "Excess nitrogen, too much shade, or heat and other weather stress may be contributing.",
        "response": "Confirm the site receives enough sun, avoid unneeded high-nitrogen fertilizer, and compare conditions with local extension guidance."
      },
      {
        "problem": "Flowers fall without pods",
        "cause": "Heat, drought, irregular moisture, or other stress during flowering can interfere with pod set.",
        "response": "Keep moisture more consistent, reduce avoidable stress, and check local recommendations for the variety and weather."
      },
      {
        "problem": "Leaves have holes or mottled patches",
        "cause": "Insects, disease, or physical damage may be present.",
        "response": "Inspect both sides of leaves and identify the cause before using any pesticide. Follow the label exactly if treatment is warranted."
      },
      {
        "problem": "Pods are tough or oversized",
        "cause": "Pods were left on the plant too long for snap-bean harvest.",
        "response": "Pick smaller and more frequently next time; use the variety's harvest guidance as your reference."
      }
    ],
    "verification": [
      "I chose a variety and planting date suited to my local conditions.",
      "I planted directly at the packet's depth and spacing.",
      "I can keep the root zone evenly moist without waterlogging it.",
      "I know how to inspect plants and harvest tender pods without damaging vines.",
      "I recorded dates, results, and a realistic plan for the next crop."
    ],
    "maintenance": [
      "Check moisture and rainfall regularly, especially during flowering and pod fill.",
      "Inspect leaves and pods every few days for emerging problems.",
      "Harvest promptly when pods are tender and refrigerate or preserve safely.",
      "Clean up the crop and rotate planting location where practical."
    ],
    "sources": [
      {
        "title": "Growing beans in home gardens",
        "publisher": "University of Minnesota Extension",
        "url": "https://extension.umn.edu/vegetables/growing-beans",
        "checked": "2026-10-09"
      },
      {
        "title": "Vegetable gardening",
        "publisher": "Penn State Extension",
        "url": "https://extension.psu.edu/vegetable-gardening",
        "checked": "2026-10-09"
      }
    ]
  },
  {
    "slug": "grow-herbs",
    "pillar": "grow",
    "title": "Grow useful culinary herbs",
    "eyebrow": "Field guide 006 / Grow",
    "summary": "Start with a few useful herbs, match each plant to its light and water needs, and harvest without exhausting it.",
    "level": "Beginner",
    "duration": "First light harvest may be possible in 3–8 weeks; plants and growing methods vary.",
    "reviewedAt": "2026-10-09",
    "reviewStatus": "reviewed",
    "overview": "Herbs are not one uniform crop. Basil likes warmth, while parsley and chives tolerate cooler conditions; rosemary prefers excellent drainage and can be difficult to overwinter outdoors in cold climates. This guide shows how to start a small mixed herb setup without treating every plant the same.",
    "budgetEstimate": "Rough U.S. estimate: $10–30 for a few seed packets or starter plants and basic potting mix if you reuse containers.",
    "prerequisites": [
      "A bright outdoor space or a suitable indoor growing light.",
      "Containers with drainage or a prepared garden area.",
      "A plan to label each herb and check its individual growing requirements."
    ],
    "supplies": [
      {
        "item": "Two or three culinary herbs",
        "amount": "Seeds or healthy starter plants"
      },
      {
        "item": "Containers with drainage",
        "amount": "One per plant or compatible group; check mature size"
      },
      {
        "item": "Quality potting mix",
        "amount": "Enough to fill containers"
      },
      {
        "item": "Watering can",
        "amount": "1"
      },
      {
        "item": "Clean scissors",
        "amount": "1 pair"
      },
      {
        "item": "Plant labels",
        "amount": "Recommended"
      }
    ],
    "safety": [
      "Use food-gardening soil and clean containers. Do not use containers that held chemicals.",
      "Identify each plant correctly before eating it; common names can refer to different species.",
      "Wash harvested herbs under clean running water and use clean tools.",
      "Keep pets and children away from plants that may be toxic to them; verify species-specific risks."
    ],
    "steps": [
      {
        "id": "choose",
        "title": "Choose herbs you will actually use",
        "instruction": "Start with two or three herbs used in meals you already cook. Basil is a warm-season annual in many climates; parsley is slower to establish; chives are often a hardy perennial. Check local guidance before choosing rosemary or other cold-sensitive herbs.",
        "detail": "Buying every herb at once creates more watering and space demands. A small set you harvest regularly is a better first system.",
        "checkpoint": "You can name each herb and describe its preferred season and mature size.",
        "timing": "Before buying"
      },
      {
        "id": "match",
        "title": "Match light and containers to each plant",
        "instruction": "Place sun-loving herbs where they receive the light recommended for that species. Use containers with drainage and fresh potting mix; choose a pot large enough for the plant's expected roots.",
        "detail": "Different herbs can have different water needs. Group plants only when their light, moisture, and growth requirements are compatible.",
        "checkpoint": "Each herb has suitable light, root space, and drainage.",
        "timing": "15–30 minutes"
      },
      {
        "id": "start",
        "title": "Sow seeds or transplant carefully",
        "instruction": "Follow the seed packet for sowing depth and spacing. For starter plants, water the root ball, loosen only tightly circling roots, set the plant at its previous soil level, and fill around it gently.",
        "detail": "Some herb seeds need light to germinate or take longer than expected. The packet's instructions for the exact species take priority over general rules.",
        "checkpoint": "Seeds are at the correct depth or transplants are stable and watered in.",
        "timing": "20–40 minutes"
      },
      {
        "id": "water",
        "title": "Water by plant and pot, not by calendar",
        "instruction": "Check the mix with a finger and water when the plant's needs and the pot's moisture level indicate it is time. Water thoroughly enough to moisten the root zone, then let excess drain. Empty standing water from saucers.",
        "detail": "Basil often needs more consistent moisture than woody Mediterranean herbs such as rosemary. Do not apply one fixed watering schedule to every herb.",
        "checkpoint": "You can explain how you decide whether each pot needs water.",
        "timing": "Check daily while establishing"
      },
      {
        "id": "observe",
        "title": "Watch for stress before adding fertilizer",
        "instruction": "Inspect new growth, leaf color, and the undersides of leaves every few days. If a plant struggles, check light, moisture, drainage, crowding, and pests before adding fertilizer or spraying anything.",
        "detail": "Use fertilizer only when appropriate for the growing medium and species, and follow the label. More fertilizer does not automatically mean better flavor or growth.",
        "checkpoint": "You have checked basic growing conditions before attempting a treatment.",
        "timing": "Every few days"
      },
      {
        "id": "harvest",
        "title": "Harvest in a way that encourages regrowth",
        "instruction": "Use clean scissors and take small amounts from established plants. For leafy herbs, avoid stripping the plant bare. For basil, pinch or cut just above a pair of leaves to encourage branching; use species-specific guidance for other herbs.",
        "detail": "Avoid harvesting more than a healthy plant can replace. Remove flowers only when that suits the herb and your goal; flowers are useful for pollinators and may be desirable on some herbs.",
        "checkpoint": "The plant retains healthy growth points and enough foliage to keep growing.",
        "timing": "When plants are established"
      },
      {
        "id": "store",
        "title": "Use, refrigerate, or dry the harvest appropriately",
        "instruction": "Rinse herbs under clean running water and dry them with clean equipment. Use fresh herbs promptly, refrigerate those that require it, or follow a reliable species-appropriate drying method if you want a shelf-stable supply.",
        "detail": "Do not assume every herb dries or stores equally well. Label preserved herbs with the plant name and date, and discard material showing mold or spoilage.",
        "checkpoint": "You have a safe plan for using or storing the harvested herb.",
        "timing": "Immediately after harvest"
      },
      {
        "id": "record",
        "title": "Keep a simple growing record",
        "instruction": "Label plants and record purchase or sowing date, light, watering observations, harvests, and any problems. Use those notes to decide which herbs earned their space.",
        "detail": "The aim is a useful kitchen supply, not a large collection that becomes difficult to maintain.",
        "checkpoint": "You can identify which plants are thriving and what to adjust next.",
        "timing": "Weekly"
      }
    ],
    "troubleshoot": [
      {
        "problem": "Leaves yellow and the mix stays wet",
        "cause": "Poor drainage or overwatering may be stressing the roots.",
        "response": "Check drainage holes, empty standing water, and let the mix reach the appropriate moisture level before watering again."
      },
      {
        "problem": "Plants are thin and stretched",
        "cause": "Insufficient light or crowding is likely.",
        "response": "Move plants toward suitable stronger light gradually and space them according to species guidance."
      },
      {
        "problem": "Basil wilts in heat",
        "cause": "The container may be drying rapidly or the plant may be stressed by intense conditions.",
        "response": "Check moisture at root depth, provide appropriate protection from extreme heat, and avoid keeping the pot saturated."
      },
      {
        "problem": "Leaves have spots, webbing, or sticky residue",
        "cause": "Pests, disease, or environmental stress may be involved.",
        "response": "Isolate affected pots if practical, identify the issue with a reliable extension source, and avoid unlabelled treatments on edible plants."
      },
      {
        "problem": "Herb tastes weak or grows slowly",
        "cause": "The species may lack enough light, have unsuitable growing conditions, or be harvested too heavily.",
        "response": "Confirm species needs, review light and root space, and allow the plant to recover before taking more foliage."
      }
    ],
    "verification": [
      "I chose herbs I use and identified each plant correctly.",
      "Each herb has suitable light, root space, drainage, and a species-appropriate watering plan.",
      "I can inspect for common stress without immediately reaching for fertilizer or pesticides.",
      "I know how to harvest while leaving healthy growth points.",
      "I recorded which herbs are useful enough to keep growing."
    ],
    "maintenance": [
      "Check each container's moisture and drainage regularly.",
      "Inspect new growth and leaf undersides every few days.",
      "Harvest modestly with clean scissors and use the crop promptly.",
      "Review seasonal needs and protect or replace plants according to local conditions."
    ],
    "sources": [
      {
        "title": "Growing herbs in home gardens",
        "publisher": "Penn State Extension",
        "url": "https://extension.psu.edu/herbs",
        "checked": "2026-10-09"
      },
      {
        "title": "Growing herbs",
        "publisher": "University of Minnesota Extension",
        "url": "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs",
        "checked": "2026-10-09"
      }
    ]
  },
  {
    "slug": "keep-bees",
    "pillar": "keep",
    "title": "Prepare for responsible beekeeping",
    "eyebrow": "Field guide 007 / Keep",
    "summary": "Assess whether bees fit your site, learn from an experienced local beekeeper, and build a seasonal care and health plan before acquiring a colony.",
    "level": "Intermediate",
    "duration": "Preparation takes weeks to months; beekeeping is a seasonal, ongoing responsibility.",
    "reviewedAt": "2026-10-09",
    "reviewStatus": "reviewed",
    "overview": "Honey bees are livestock that require knowledge, equipment, time, and money. This guide is a responsible entry pathway, not a substitute for hands-on instruction. Do not purchase a colony until local rules, neighbors, forage, water, protective equipment, and access to experienced help have been addressed.",
    "budgetEstimate": "Costs vary widely by region and equipment. Expect startup costs to include a hive, protective gear, tools, a colony, training, and recurring health-management supplies; obtain local quotes before committing.",
    "prerequisites": [
      "Confirm local and state rules, property restrictions, registration requirements, and any setback rules.",
      "Identify a local beekeeping association, extension educator, or experienced mentor willing to provide hands-on guidance.",
      "Ensure everyone who may be exposed understands sting risk and has an emergency plan appropriate to known allergies."
    ],
    "supplies": [
      {
        "item": "Introductory beekeeping course or mentor",
        "amount": "Before ordering bees"
      },
      {
        "item": "Suitable hive and stand",
        "amount": "Select with local mentor and climate in mind"
      },
      {
        "item": "Properly fitted veil and protective clothing",
        "amount": "Required for hive work"
      },
      {
        "item": "Hive tool and appropriate smoker",
        "amount": "Learn safe use with a mentor"
      },
      {
        "item": "Clean water source",
        "amount": "Reliable during warm weather"
      },
      {
        "item": "Local inspection and health-management plan",
        "amount": "Written before acquiring a colony"
      }
    ],
    "safety": [
      "People with known or suspected severe sting allergy should discuss exposure and emergency planning with a qualified clinician before participating.",
      "Never open a hive alone as a first-time keeper. Learn protective equipment, smoker handling, and colony inspection in person.",
      "Do not place hives where flight paths endanger neighbors, pets, sidewalks, or public spaces. Follow local rules and communicate with affected neighbors.",
      "Use only approved treatments according to current label directions and local extension or veterinary guidance. Record treatment dates and honey supers restrictions.",
      "Avoid improvised chemical treatments and do not assume honey production is guaranteed."
    ],
    "steps": [
      {
        "id": "rules",
        "title": "Confirm legality and site suitability",
        "instruction": "Check municipal rules, lease or HOA terms, state registration, required setbacks, and any local nuisance or water requirements. Assess sunlight, wind protection, safe access, flight paths, and a reliable water source.",
        "detail": "A site that looks convenient to you may create problems for neighbors or people walking nearby. A local mentor can help assess the actual property before you spend money.",
        "checkpoint": "You have confirmed rules and have a safe, permitted site.",
        "timing": "Before buying equipment"
      },
      {
        "id": "learn",
        "title": "Find hands-on instruction first",
        "instruction": "Join a local beekeeping association or course and arrange to observe an experienced keeper through a full inspection. Learn how to recognize normal brood, food stores, queen status, disease signs, and when to ask for help.",
        "detail": "Books and videos cannot replace practice handling live colonies. The first season should prioritize learning colony health and safe technique over harvesting honey.",
        "checkpoint": "A mentor has agreed to help you learn inspections and local seasonal timing.",
        "timing": "Several weeks or months"
      },
      {
        "id": "budget",
        "title": "Build a realistic equipment and time plan",
        "instruction": "Price a compatible hive system, protective clothing, tools, colony, feed if needed, health monitoring, transport, and recurring supplies. Plan for regular inspections during the active season and urgent attention during adverse weather or suspected disease.",
        "detail": "Do not buy mismatched used equipment without inspecting it with an experienced keeper. Equipment can carry pests or pathogens, and local recommendations differ.",
        "checkpoint": "Your budget includes ongoing care, not just the initial hive and bees.",
        "timing": "Before ordering a colony"
      },
      {
        "id": "prepare",
        "title": "Set up water, stand, and flight management",
        "instruction": "Install the stand securely and set the hive in its planned location. Provide a dependable clean water source before bees need it, and use mentor-approved barriers or orientation methods if needed to direct flight paths away from people.",
        "detail": "Bees may forage over a wide area, but the hive entrance and nearby water can influence where activity concentrates. Keep access clear and the hive stable.",
        "checkpoint": "The site is secure, accessible for safe work, and designed to reduce conflicts.",
        "timing": "Before bees arrive"
      },
      {
        "id": "colony",
        "title": "Acquire bees with local guidance",
        "instruction": "Choose a reputable local supplier and a colony type suited to your climate and experience. Coordinate arrival and installation with your mentor; do not improvise installation or combine colonies based only on online advice.",
        "detail": "Transport, timing, and installation differ by colony format and region. Ask your mentor to supervise the first installation and explain what normal settling-in looks like.",
        "checkpoint": "The colony was acquired legally and installed with qualified hands-on guidance.",
        "timing": "At the locally appropriate season"
      },
      {
        "id": "inspect",
        "title": "Learn a calm, consistent inspection routine",
        "instruction": "With your mentor, inspect at locally recommended intervals and record brood pattern, eggs or young larvae, food stores, temperament, space, and any signs of pests or disease. Work in suitable weather and stop if conditions become unsafe.",
        "detail": "Do not open colonies during storms or extreme conditions. Keep smoke use and hive handling within what you have been taught; close the hive properly and record what you observed.",
        "checkpoint": "You can describe colony condition from written observations and know when to seek help.",
        "timing": "Seasonal, mentor-guided"
      },
      {
        "id": "health",
        "title": "Monitor pests and diseases responsibly",
        "instruction": "Follow your local extension or apiary-inspector plan for monitoring Varroa mites and other locally relevant threats. Use validated monitoring methods and approved controls only when indicated, following label directions and honey-super restrictions.",
        "detail": "Pest pressure changes by season and region. Visual inspection alone may miss important problems; ask your mentor how and when to sample and record results.",
        "checkpoint": "You have a written monitoring calendar and know whom to contact when results are concerning.",
        "timing": "At the recommended local intervals"
      },
      {
        "id": "winter",
        "title": "Prepare for seasonal changes and review",
        "instruction": "Use local guidance to assess food stores, ventilation, moisture, pests, and winter preparation. Review records with your mentor and plan equipment repairs or colony support before the next season.",
        "detail": "Winter survival depends on climate, colony strength, stores, pests, and management. Avoid universal feed amounts or guarantees; use local advice for your hive and conditions.",
        "checkpoint": "Your records and local plan cover the next seasonal transition.",
        "timing": "Before seasonal conditions change"
      }
    ],
    "troubleshoot": [
      {
        "problem": "Bees behave unusually defensive",
        "cause": "Weather, colony condition, disturbance, genetics, or other factors may contribute.",
        "response": "Stop the inspection safely, move away from the flight path, and contact your mentor. Reassess timing, technique, and site safety before another visit."
      },
      {
        "problem": "You see many mites, damaged brood, or a collapsing colony",
        "cause": "A serious pest or disease issue may be present.",
        "response": "Avoid guessing at treatment. Contact your mentor and local apiary inspector or extension service promptly, follow approved monitoring and treatment guidance, and document observations."
      },
      {
        "problem": "Bees gather at a neighbor's pool or outdoor tap",
        "cause": "The colony may be using an easy nearby water source.",
        "response": "Provide a consistent safer water source on your property and ask a local mentor about site adjustments. Communicate respectfully and follow local nuisance rules."
      },
      {
        "problem": "You cannot safely complete an inspection",
        "cause": "Weather, equipment fit, temperament, or inexperience may make the work unsafe.",
        "response": "Close the hive if safe to do so, leave the area, and arrange an experienced keeper to help. Do not force the inspection."
      }
    ],
    "verification": [
      "I checked local laws, property restrictions, and registration requirements.",
      "I found a local course or mentor for hands-on learning.",
      "I have a realistic budget and ongoing time plan.",
      "The site, water, equipment, and sting emergency plan are ready.",
      "I know how to record observations and who to contact about pests, disease, or unsafe behavior."
    ],
    "maintenance": [
      "Follow local seasonal inspection recommendations and record findings.",
      "Monitor pests using validated methods and act on current local guidance.",
      "Maintain protective equipment, hive stands, water, and secure access.",
      "Review colony health and seasonal plans with an experienced local beekeeper.",
      "Do not harvest honey until colony health, stores, and local guidance support it."
    ],
    "sources": [
      {
        "title": "Beekeeping",
        "publisher": "Penn State Extension",
        "url": "https://extension.psu.edu/insects-pests-and-diseases/pollinators/beekeeping",
        "checked": "2026-10-09"
      },
      {
        "title": "Honey Bee Health",
        "publisher": "USDA Agricultural Research Service",
        "url": "https://www.ars.usda.gov/oc/br/honey-bee-health/",
        "checked": "2026-10-09"
      }
    ]
  },
  {
    "slug": "preserve-fermented-vegetables",
    "pillar": "preserve",
    "title": "Ferment vegetables safely",
    "eyebrow": "Field guide 008 / Preserve",
    "summary": "Set up a small vegetable fermentation using a tested recipe, clean equipment, controlled salt, and a reliable way to judge the result.",
    "level": "Intermediate",
    "duration": "Often several days to weeks, depending on the tested recipe, temperature, and vegetable.",
    "reviewedAt": "2026-10-09",
    "reviewStatus": "reviewed",
    "overview": "Fermentation is a food-preservation process that depends on the correct ingredients, salt concentration, temperature, time, and handling. This guide teaches the workflow, but it intentionally does not invent a universal salt ratio or fermentation time. Choose one tested recipe from a recognized food-preservation authority and follow its ingredient amounts and process exactly.",
    "budgetEstimate": "Rough U.S. estimate: $10–30 for a small batch if you already have a food-safe vessel and basic kitchen tools; specialized fermentation weights or airlocks add cost.",
    "prerequisites": [
      "A tested recipe for the exact vegetable and method from a recognized food-preservation authority.",
      "A food-safe vessel, clean utensils, accurate measuring tools, and a way to follow the recipe's temperature guidance.",
      "Enough refrigerator space or another storage method explicitly specified by the tested recipe."
    ],
    "supplies": [
      {
        "item": "Fresh, sound vegetables",
        "amount": "Exact amount in the selected tested recipe"
      },
      {
        "item": "Salt and any other ingredients",
        "amount": "Exact type and amount required by the recipe"
      },
      {
        "item": "Food-safe fermentation vessel",
        "amount": "Sized for the recipe"
      },
      {
        "item": "Approved weight or method to keep vegetables submerged",
        "amount": "As specified by the recipe"
      },
      {
        "item": "Clean knife, cutting board, and measuring tools",
        "amount": "1 set"
      },
      {
        "item": "Label and date marker",
        "amount": "1"
      }
    ],
    "safety": [
      "Do not substitute a social-media recipe for a tested food-preservation recipe. Do not guess salt amounts, temperature, time, or storage life.",
      "Use the recipe's specified salt type and concentration. Reduced-sodium substitutions can make fermentation unsafe unless a tested recipe explicitly supports them.",
      "Keep vegetables submerged using the tested method and use clean equipment. Do not seal an actively fermenting vessel unless it is designed to safely vent pressure.",
      "Discard the batch if you see unexpected fuzzy mold, unusual discoloration, or signs of spoilage, or if the tested recipe says the batch has failed. Do not taste questionable food to check safety.",
      "Fermented vegetables are not automatically shelf-stable. Refrigerate or process for storage only as directed by the tested recipe."
    ],
    "steps": [
      {
        "id": "recipe",
        "title": "Choose the exact tested recipe first",
        "instruction": "Select a recipe for the exact vegetable and fermentation method from the National Center for Home Food Preservation or a university extension food-preservation program. Read it from start to finish before buying ingredients.",
        "detail": "Different vegetables, cuts, vessel sizes, and fermentation methods can require different salt levels and conditions. Do not combine instructions from several recipes.",
        "checkpoint": "You have one complete, tested recipe and understand its ingredient amounts, temperature, time, and storage instructions.",
        "timing": "Before preparation"
      },
      {
        "id": "inspect",
        "title": "Sort and prepare fresh produce",
        "instruction": "Use fresh, sound vegetables and discard damaged or spoiled pieces. Wash and prepare produce, remove stems or trim as the recipe directs, and cut to the specified size.",
        "detail": "The recipe's preparation details are part of the process. Do not change the cut size or batch scale casually because it can change how the food ferments.",
        "checkpoint": "Produce is sound, clean, and prepared exactly as instructed.",
        "timing": "Follow recipe"
      },
      {
        "id": "clean",
        "title": "Prepare equipment and measure precisely",
        "instruction": "Clean the vessel, utensils, and work surface according to the recipe. Measure vegetables, salt, and liquid accurately using the specified units and tools.",
        "detail": "Clean equipment reduces avoidable contamination but does not replace the recipe's salt and fermentation controls. Do not estimate salt by eye.",
        "checkpoint": "All ingredients and equipment are ready, and the quantities match the recipe.",
        "timing": "Follow recipe"
      },
      {
        "id": "pack",
        "title": "Pack and submerge the vegetables",
        "instruction": "Pack the vegetables and add brine or other ingredients exactly as the recipe directs. Use the specified weight or method to keep solids below the liquid surface, and leave the required headspace.",
        "detail": "Exposed pieces can mold or spoil. Use only a food-safe weight and a vessel appropriate for fermentation. Leave space for bubbling and expansion as the recipe specifies.",
        "checkpoint": "Vegetables are submerged and the vessel is prepared as the recipe requires.",
        "timing": "Follow recipe"
      },
      {
        "id": "ferment",
        "title": "Control temperature and observe the batch",
        "instruction": "Keep the vessel within the recipe's temperature range and follow its venting instructions. Record the start date and inspect as directed without repeatedly disturbing the batch.",
        "detail": "Fermentation rate changes with temperature. Bubbles or cloudiness can occur in normal fermentation, but appearance alone does not prove safety. Use the tested recipe's full criteria.",
        "checkpoint": "The batch has stayed within the specified conditions and observations are recorded.",
        "timing": "For the full recipe duration"
      },
      {
        "id": "judge",
        "title": "Evaluate only against the recipe's criteria",
        "instruction": "At the recipe's stated time, check the required acidity or other completion indicators using the specified method. Do not rely only on smell, taste, bubbling, or elapsed days.",
        "detail": "If the batch deviated from the process, shows unexpected mold or spoilage, or fails the recipe's criteria, do not try to rescue it by adding salt or extending the time without authoritative guidance.",
        "checkpoint": "The batch meets the tested recipe's completion criteria, or it is safely discarded if it does not.",
        "timing": "At the recipe's stated endpoint"
      },
      {
        "id": "store",
        "title": "Store it exactly as directed",
        "instruction": "Transfer, refrigerate, or further process the fermented food only as the tested recipe directs. Label the container with the food name, batch date, and any use-by guidance provided by the source.",
        "detail": "Do not assume a fermented product can be stored at room temperature. Shelf stability requires a validated process for that specific product.",
        "checkpoint": "The finished batch is stored under the method and conditions specified by the tested recipe.",
        "timing": "Immediately after completion"
      },
      {
        "id": "record",
        "title": "Keep a batch record",
        "instruction": "Record the recipe source and version, ingredients and measurements, start date, temperature observations, completion checks, and storage method. Use this record to reproduce the same tested process next time.",
        "detail": "Change only what the tested recipe permits. If you want to scale or alter a recipe, find an authoritative version that covers that change.",
        "checkpoint": "You can trace the batch to the exact tested recipe and process.",
        "timing": "At each stage"
      }
    ],
    "troubleshoot": [
      {
        "problem": "Vegetables rise above the brine",
        "cause": "The weight is too small, the vessel is overfilled, or gases have moved pieces upward.",
        "response": "Follow the recipe's approved method to restore submersion using clean equipment. If contamination or spoilage is evident, discard the batch."
      },
      {
        "problem": "No visible bubbles appear",
        "cause": "Temperature, vegetable type, or fermentation stage may affect visible activity; lack of bubbles alone is not a safety test.",
        "response": "Check the recipe's temperature range and completion criteria. Do not add ingredients or extend time based on guesswork."
      },
      {
        "problem": "Fuzzy mold or unexpected discoloration appears",
        "cause": "The batch may have been exposed to air or contaminated.",
        "response": "Follow the tested source's discard guidance. Do not taste questionable food or attempt to scrape away mold and keep the remainder."
      },
      {
        "problem": "The batch smells strongly unpleasant or seems spoiled",
        "cause": "The process may have failed or the food may be spoiled.",
        "response": "Do not taste it to confirm. Discard it safely and review whether the tested recipe, measurements, temperature, and submersion requirements were followed."
      },
      {
        "problem": "You want to reduce salt or change the recipe",
        "cause": "A change may alter fermentation conditions and food safety.",
        "response": "Do not improvise substitutions. Find a tested recipe specifically designed for that change or keep the original recipe unchanged."
      }
    ],
    "verification": [
      "I chose one tested recipe from a recognized food-preservation authority.",
      "I measured ingredients and followed the recipe's salt, temperature, timing, and vessel instructions exactly.",
      "I kept vegetables submerged and followed the correct venting method.",
      "I evaluated completion using the recipe's criteria rather than appearance alone.",
      "I labeled and stored the batch exactly as directed, and I can trace it to the source."
    ],
    "maintenance": [
      "Follow the recipe's specified temperature, venting, and inspection schedule throughout fermentation.",
      "Keep a record of ingredients, dates, observations, and completion checks.",
      "Store only under conditions explicitly allowed by the tested recipe.",
      "Discard questionable or failed batches rather than trying to rescue them.",
      "Use a tested recipe again for every new vegetable, method, or allowed variation."
    ],
    "sources": [
      {
        "title": "Fermenting",
        "publisher": "National Center for Home Food Preservation",
        "url": "https://nchfp.uga.edu/how/ferment/",
        "checked": "2026-10-09"
      },
      {
        "title": "Food Preservation",
        "publisher": "Penn State Extension",
        "url": "https://extension.psu.edu/food-preservation",
        "checked": "2026-10-09"
      }
    ]
  }
];

export function getFieldGuide(slug: string) {
  return FIELD_GUIDES.find((guide) => guide.slug === slug);
}
