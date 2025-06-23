-- Database Schema for Pokémon Battle Application

-- 1. Create pokemon_type table
CREATE TABLE pokemon_type (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 2. Create pokemon table
CREATE TABLE pokemon (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type UUID NOT NULL REFERENCES pokemon_type(id),
    image TEXT NOT NULL,
    power INTEGER NOT NULL CHECK (power >= 10 AND power <= 100),
    life INTEGER NOT NULL CHECK (life >= 10 AND life <= 100)
);

-- 3. Create weakness table
CREATE TABLE weakness (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type1 UUID NOT NULL REFERENCES pokemon_type(id),
    type2 UUID NOT NULL REFERENCES pokemon_type(id),
    factor FLOAT NOT NULL,
    UNIQUE(type1, type2)
);

-- 4. Create teams table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    pokemon_ids UUID[] NOT NULL CHECK (array_length(pokemon_ids, 1) = 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data

-- Insert Pokémon types
INSERT INTO pokemon_type (id, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Fire'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Water'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Grass');

-- Insert weakness chart data
INSERT INTO weakness (type1, type2, factor) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1.0),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 0.5),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 2.0),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2.0),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1.0),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 0.5),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 0.5),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 2.0),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 1.0);

-- Insert sample Pokémon (5 for each type) - adjusted to fit 10-100 constraints
INSERT INTO pokemon (name, type, image, power, life) VALUES
    -- Fire Pokémon
    ('Charizard', '550e8400-e29b-41d4-a716-446655440001', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', 85, 78),
    ('Arcanine', '550e8400-e29b-41d4-a716-446655440001', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png', 80, 90),
    ('Ninetales', '550e8400-e29b-41d4-a716-446655440001', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png', 75, 73),
    ('Rapidash', '550e8400-e29b-41d4-a716-446655440001', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png', 70, 65),
    ('Magmar', '550e8400-e29b-41d4-a716-446655440001', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/126.png', 75, 65),
    
    -- Water Pokémon
    ('Blastoise', '550e8400-e29b-41d4-a716-446655440002', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', 85, 79),
    ('Gyarados', '550e8400-e29b-41d4-a716-446655440002', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png', 90, 95),
    ('Vaporeon', '550e8400-e29b-41d4-a716-446655440002', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png', 80, 95),
    ('Lapras', '550e8400-e29b-41d4-a716-446655440002', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png', 85, 95),
    ('Starmie', '550e8400-e29b-41d4-a716-446655440002', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png', 75, 60),
    
    -- Grass Pokémon
    ('Venusaur', '550e8400-e29b-41d4-a716-446655440003', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', 85, 80),
    ('Exeggutor', '550e8400-e29b-41d4-a716-446655440003', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png', 80, 95),
    ('Victreebel', '550e8400-e29b-41d4-a716-446655440003', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png', 75, 80),
    ('Tangela', '550e8400-e29b-41d4-a716-446655440003', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png', 70, 65),
    ('Parasect', '550e8400-e29b-41d4-a716-446655440003', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png', 70, 60);

-- PostgreSQL Functions

-- Function to insert a team of 6 Pokémon
CREATE OR REPLACE FUNCTION insert_team(team_name TEXT, pokemon_ids UUID[])
RETURNS UUID AS $$
DECLARE
    team_id UUID;
BEGIN
    -- Validate that exactly 6 Pokémon are provided
    IF array_length(pokemon_ids, 1) != 6 THEN
        RAISE EXCEPTION 'Team must contain exactly 6 Pokémon';
    END IF;
    
    -- Validate that all Pokémon exist
    IF EXISTS (
        SELECT 1 FROM unnest(pokemon_ids) AS pid
        WHERE NOT EXISTS (SELECT 1 FROM pokemon WHERE id = pid)
    ) THEN
        RAISE EXCEPTION 'One or more Pokémon do not exist';
    END IF;
    
    -- Insert the team
    INSERT INTO teams (name, pokemon_ids)
    VALUES (team_name, pokemon_ids)
    RETURNING id INTO team_id;
    
    RETURN team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all teams ordered by total power
CREATE OR REPLACE FUNCTION get_teams_with_power()
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    pokemon_ids UUID[],
    total_power INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.pokemon_ids,
        COALESCE(SUM(p.power), 0)::INTEGER as total_power,
        t.created_at
    FROM teams t
    LEFT JOIN unnest(t.pokemon_ids) AS pokemon_id ON true
    LEFT JOIN pokemon p ON p.id = pokemon_id
    GROUP BY t.id, t.name, t.pokemon_ids, t.created_at
    ORDER BY total_power DESC;
END;
$$ LANGUAGE plpgsql; 