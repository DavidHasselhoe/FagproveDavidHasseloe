-- USERS
CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now ()
    );

-- COMPETITIONS
CREATE TABLE
    IF NOT EXISTS competitions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        prize VARCHAR(255),
        winner_user_id INT REFERENCES users (id),
        drawn_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now (),
        is_archived BOOLEAN DEFAULT FALSE
    );

-- TOURS
CREATE TABLE
    IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        competition_id INT NOT NULL REFERENCES competitions (id) ON DELETE CASCADE,
        date DATE NOT NULL,
        location VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT now ()
    );