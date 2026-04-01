-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    state_id VARCHAR(100),
    lga_id VARCHAR(100),
    area VARCHAR(255),
    device_token VARCHAR(255) UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    password VARCHAR(255), -- For admin login
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    contact_email VARCHAR(255) UNIQUE,
    contact_phone VARCHAR(20),
    password VARCHAR(255),
    states_covered TEXT[], -- Array of states they cover
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Needs Table
CREATE TABLE IF NOT EXISTS needs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted',
    admin_notes TEXT,
    user_comments TEXT,
    assigned_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Config Table
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Categories (To match the hardcoded values in SubmitForm.tsx)
INSERT INTO categories (id, name) VALUES 
('edu', 'Education'),
('water', 'Water/Sanitation'),
('health', 'Health'),
('power', 'Power/Electricity'),
('roads', 'Infrastructure/Roads'),
('security', 'Security')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Config
INSERT INTO config (key, value) VALUES 
('PLATFORM_NAME', 'NaijaNeed'),
('PLATFORM_TAGLINE', 'Tell us what you need.'),
('WEEKLY_LIMIT', '1'),
('MAP_VISIBLE', 'true')
ON CONFLICT (key) DO NOTHING;
