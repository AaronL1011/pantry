# Pantry
A minimalist, opinionated and self-hosted approach to pantry management and shopping list automation.

![Screenshots of the app pages](/static/preview.png)

## Getting Started

Pantry runs as a docker container, pull the image with:
```bash
docker pull ghcr.io/aaronl1011/pantry
```
and run it:
```bash
docker run -p 3000:3000 ghcr.io/aaronl1011/pantry
```

or using docker-compose:
```yaml
pantry:
    image: ghcr.io/aaronl1011/pantry:latest
    container_name: pantry
    volumes:
      - /path/to/your/pantry.db:/app/pantry.db
    ports:
      - "3000:3000"
    restart: unless-stopped

```
## Tech Stack
- SvelteKit w/ Svelte 5
- TailwindCSS
- Server Sent Events
- Kysely
- SQLite

## Guide

1. Build your pantry
    - Fill it with ingredients and other things you buy regularly! The app seeds with a variety of items, customise it to your needs.
2. Create your recipes
    - Define the portion count of your meal during creation and add your ingredients. Set the quantity of ingredients relative to the configured portion.
3. Choose what to cook
    - Select recipes you'd like to cook and set the desired portions. Your shopping list will be populated with a summed set of recipe ingredients that are NOT in stock.
4. Do your shopping
    - Swipe away shopping list items as you purchase them. Item quantities will scale to include enough for all recipes currently set to cook!
5. ???
6. Profit!