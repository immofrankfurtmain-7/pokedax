CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS cards_name_trgm_idx ON cards USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cards_set_id_idx ON cards (set_id);
CREATE INDEX IF NOT EXISTS cards_price_market_idx ON cards (price_market DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS cards_rarity_idx ON cards (rarity);
