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
        instruction: "Place packages in the freezer promptly, leaving room for cold air to circulate around the batch until frozen. Once solid, organize them together so older packages are easy to use first.",
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

];

export function getFieldGuide(slug: string) {
  return FIELD_GUIDES.find((guide) => guide.slug === slug);
}
