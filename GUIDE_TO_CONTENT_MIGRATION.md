# Guide: Migrating Bella's Dresser to Astro Content Collections

This guide outlines the steps to move hardcoded text and image paths from your code (`HeroStage.svelte`) into **Astro Content Collections**. This will make the site easier to update and prepare it for a CMS (like Decap CMS) in the future.

## Why do this?

1.  **Easier Updates:** You can edit a single text/JSON file to change images, titles, and descriptions without touching the complex animation code.
2.  **Safety:** If you misspell an image path or forget a field, Astro will warn you during the build (thanks to Zod schemas).
3.  **CMS Ready:** This structure is exactly what CMS tools expect, allowing us to easily add a visual editor later.

---

## Phase 1: Define the Data Structure

First, we need to tell Astro what our data looks like. We'll create a "schema" that defines the fields for our homepage.

**Action:** Create (or edit) `src/content/config.ts`.

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'data', // 'data' means JSON/YAML files, 'content' means Markdown
  schema: z.object({
    hero: z.object({
      bg: z.string(),
      cloud: z.string(),
      watertower: z.string(),
      treeline: z.string(),
      ground: z.string(),
      storeBase: z.string(),
      store: z.string(),
      bella: z.string(),
      grass: z.string(),
    }),
    atelier: z.object({
      title: z.string(),
      description: z.string(),
    }),
    newArrivals: z.object({
      title: z.string(),
      description: z.string(),
    }),
    footer: z.object({
      copyright: z.string(),
    })
  }),
});

export const collections = {
  'pages': pagesCollection,
};
```

---

## Phase 2: Create the Content File

Now we extract the hardcoded values from `HeroStage.svelte` and put them into a clean data file.

**Action:** Create `src/content/pages/home.json`.

```json
{
  "hero": {
    "bg": "/sd.png",
    "cloud": "/cloudl3.png",
    "watertower": "/bobber3b.png",
    "treeline": "/treeline6.png",
    "ground": "/snow-ground.svg",
    "storeBase": "/store-base.png",
    "store": "/bella-store-transparent.png",
    "bella": "/bella-pose3.png",
    "grass": "/grass-foreground.png"
  },
  "atelier": {
    "title": "The Atelier",
    "description": "Tucked away in a watercolor world, Bella’s Dresser is where sketches come to life."
  },
  "newArrivals": {
    "title": "New Arrivals",
    "description": "Scroll to see the collection."
  },
  "footer": {
    "copyright": "© Bella’s Dresser"
  }
}
```

*Note: For the "winter" theme, you could simply create a `home-winter.json` or add a `theme` field to switch sets of images.*

---

## Phase 3: Update the Astro Page

We need to fetch this data in your main Astro page and pass it to the Svelte component.

**Action:** Update `src/pages/index.astro`.

```astro
---
import HeroStage from '../components/HeroStage.svelte';
import { getEntry } from 'astro:content';

// Fetch the 'home' entry from the 'pages' collection
const homePage = await getEntry('pages', 'home');
const { data } = homePage;
---

<!DOCTYPE html>
<html lang="en">
<!-- ... head ... -->
<body>
  <div class="texture"></div>
  
  <!-- Pass the data object as a prop to the component -->
  <HeroStage client:load content={data} />
  
</body>
</html>
```

---

## Phase 4: Refactor the Svelte Component

Finally, update the component to use the props instead of hardcoded strings.

**Action:** Update `src/components/HeroStage.svelte`.

```svelte
<script lang="ts">
  // ... imports
  
  // 1. Accept the content prop
  export let content; 

  // 2. Use content values in your logic
  // (You might map this to your internal 'theme' structure if you want to keep that logic)
  const theme = {
      bg: content.hero.bg,
      cloud: content.hero.cloud,
      watertower: content.hero.watertower,
      treeline: content.hero.treeline,
      ground: content.hero.ground,
      store: content.hero.store,
      storeBase: content.hero.storeBase,
      bella: content.hero.bella,
      grass: content.hero.grass
  };
  
  // ... rest of logic
</script>

<!-- ... html -->

<!-- Replace hardcoded text with variables -->
<section class="content" data-section style="margin-top: 100vh;">
  <div class="copy">
    <h2>{content.atelier.title}</h2>
    <p>{content.atelier.description}</p>
  </div>
</section>

<!-- ... -->
```

## Next Steps

Once this is done, adding **Decap CMS** is very straightforward:
1.  Add `admin/index.html` and `admin/config.yml`.
2.  Point the config to edit `src/content/pages/home.json`.
3.  Deploy! You will then have a `/admin` dashboard to change text and images.
