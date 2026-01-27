# Bella's Dresser - Interactive Experience

An immersive, highly visual Single Page Application (SPA) built with **Astro** and **Svelte**, utilizing **GSAP** for complex parallax and transition animations.

## 🌟 Architectural Overview

The core concept is a **"Stage"** or **"World"** – a large, vertically stacked set of scenes (Home, Shop, Gallery, Contact, About) that the user navigates through. 

Instead of traditional page loads, the application intercepts navigation to "pan" the camera (viewport) to the correct location in this persistent world.

### Key Technologies
- **Astro**: Core framework for structure and routing.
- **Svelte**: Used for interactive, stateful components (e.g., `Snow.svelte`).
- **GSAP (GreenSock)**: Powers the seamless navigation, parallax effects, and camera movements.
- **TypeScript**: Ensures type safety across logic and components.

## 📂 Project Structure

```text
/
├── public/               # Static assets (images, logos, etc.)
├── src/
│   ├── components/
│   │   ├── Stage.astro   # The visual "World" containing all scenes & layers
│   │   └── Snow.svelte   # Interactive particle effect
│   ├── layouts/
│   │   └── StageLayout.astro # Main app shell; persists the Stage across routes
│   ├── scripts/
│   │   └── stage-router.ts   # The brain; handles GSAP navigation & routing logic
│   └── pages/            # Astro routes (serve as entry points/URL structures)
│       ├── index.astro
│       ├── about.astro
│       ├── shop.astro
│       ├── gallery.astro
│       └── contact.astro
```

## 🧠 Core Systems

### 1. The Stage (`src/components/Stage.astro`)
This "God Component" renders the entire visual world. It contains the HTML structure for every scene:
- **Home Scene**: Features a complex multi-layer parallax effect (sky, clouds, mountains, storefront).
- **About Scene**: Implements a unique horizontal scrolling container within the vertical world.
- **Navigation**: Contains the visual UI for navigating between scenes.

### 2. The Router (`src/scripts/stage-router.ts`)
This script takes over standard browser navigation:
- **Event Delegation**: Intercepts clicks on links.
- **Camera Movement**: Calculates vertical offsets for target scenes.
- **Animation**: Uses `gsap.to('#world')` to smoothly pan the view to the requested section.
- **Special Logic**: Handles specific behaviors, such as the horizontal scroll for the "About" section.

### 3. The Layout (`src/layouts/StageLayout.astro`)
Acts as the persistent shell. It ensures the `Stage` component remains loaded in the background while handling the initial application load state.

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |