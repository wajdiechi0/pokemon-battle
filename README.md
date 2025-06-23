# Pokémon Battle Application

A full-stack Next.js app for building, managing, and battling Pokémon teams, using Supabase (PostgreSQL) as the backend.

---

## Features

- **Pokémon CRUD**: Add, edit, and delete Pokémon with type, power, and life stats.
- **Team Builder**: Create, edit, and delete teams of exactly 6 Pokémon.
- **Battle Simulation**: Simulate battles between teams, with round-by-round logic and type effectiveness.
- **Type System**: Fire, Water, and Grass types with a classic weakness chart.
- **Modern UI**: Built with Next.js, Tailwind CSS, and Material-UI.
- **Supabase Integration**: All data is stored in a PostgreSQL database via Supabase.

---

## Setup & Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Data Structure, Schema, and Algorithm Rationale

### Data Structure & Schema

- **Pokémon Table**: Each Pokémon has a unique ID, name, type, image, power, and life. Power and life are constrained (10-100) for game balance.
- **Type Table**: Types are normalized for extensibility (easy to add more types).
- **Weakness Table**: Stores type effectiveness as a matrix, allowing for flexible matchup logic.
- **Teams Table**: Each team stores an array of 6 Pokémon IDs, enforcing the team size constraint at the DB level.
- **PostgreSQL Functions**: Used for atomic team creation and for efficient power calculation and sorting.

**Why this design?**
- **Normalization**: Makes it easy to add more types, Pokémon, or rules in the future.
- **Constraints**: Enforced at the DB level for data integrity (e.g., team size, stat ranges).
- **Extensibility**: Adding new types, weaknesses, or Pokémon is simple and safe.
- **Performance**: Power calculation and team sorting are handled in the database for efficiency.

### Battle Algorithm

- **1v1 Rounds**: Each round is a 1v1 fight. The remaining life is calculated as:
  ```
  remaining_life = current_life - opponent_power * type_factor
  ```
- **Type Factor**: Pulled from the weakness table for each matchup.
- **Switching**: When a Pokémon faints, the next in the team takes its place.
- **Victory**: The team with remaining Pokémon wins. The battle log tracks each round and the state of all Pokémon after each round, allowing for replay and visualization.

---

## Why This Stack?

- **Next.js**: Modern React framework with SSR, API routes, and great DX.
- **Supabase**: Instant Postgres with RESTful API, real-time, and easy auth.
- **Tailwind CSS**: Rapid, utility-first styling.
- **Material-UI**: For accessible, beautiful UI components.
- **PostgreSQL Functions**: For atomic, efficient, and safe data operations.

---

## License

MIT
