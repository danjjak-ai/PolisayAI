-- 01: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 02: Politicians / KOLs Table
CREATE TABLE IF NOT EXISTS politicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ko TEXT NOT NULL,
    name_ja TEXT,
    country TEXT CHECK (country IN ('KR', 'JP')),
    position TEXT,
    party TEXT,
    bio TEXT,
    sns_handles JSONB, -- { "x": "@handle", "youtube": "channel_id" }
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 03: Speeches / Statements Table
CREATE TABLE IF NOT EXISTS speeches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES politicians(id),
    content TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('legislation', 'sns', 'news', 'community')),
    source_url TEXT,
    language TEXT CHECK (language IN ('ko', 'ja')),
    speech_date TIMESTAMP WITH TIME ZONE,
    embedding vector(1536), -- For semantic similarity (OpenAI standard)
    relevance_score FLOAT DEFAULT 1.0, -- LLM-scored policy relevance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 04: Policies / Announcements Table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    issuing_body TEXT, -- e.g., "Chuikyo", "Ministry of Health"
    country TEXT CHECK (country IN ('KR', 'JP')),
    effective_date DATE,
    policy_url TEXT,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 05: Topic Classifications
CREATE TABLE IF NOT EXISTS topic_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID NOT NULL, -- FK to either speeches.id or policies.id
    reference_type TEXT CHECK (reference_type IN ('speech', 'policy')),
    topic_label TEXT NOT NULL, -- e.g., "Medical DX", "Drug Pricing"
    confidence_score FLOAT,
    method TEXT, -- "LDA", "BERTopic", "LLM"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 06: Impact Analysis (Change Point Detection)
CREATE TABLE IF NOT EXISTS impact_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES politicians(id),
    policy_id UUID REFERENCES policies(id),
    topic_label TEXT,
    change_point_date TIMESTAMP WITH TIME ZONE,
    sentiment_before FLOAT,
    sentiment_after FLOAT,
    impact_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 07: Gap Analysis (Demand vs Supply)
CREATE TABLE IF NOT EXISTS gap_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_label TEXT NOT NULL,
    country TEXT,
    demand_volume FLOAT, -- Derived from community/SNS
    supply_volume FLOAT, -- Derived from policy announcements
    gap_score FLOAT, -- (Demand - Supply)
    analysis_date DATE DEFAULT CURRENT_DATE
);

-- Indices for performance
CREATE INDEX idx_speeches_politician ON speeches(politician_id);
CREATE INDEX idx_speeches_date ON speeches(speech_date);
CREATE INDEX idx_policies_country ON policies(country);
CREATE INDEX idx_topics_label ON topic_classifications(topic_label);
