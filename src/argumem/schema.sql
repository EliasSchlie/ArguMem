BEGIN;

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_edited TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  raw_text TEXT NOT NULL,
  context TEXT,
  title TEXT
);

CREATE TABLE propositions (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_edited TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  core_thesis TEXT NOT NULL
);

CREATE TABLE quotations (
  id INTEGER PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_edited TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  quotation_text TEXT NOT NULL,
  locator TEXT
);

CREATE TABLE arguments (
  id INTEGER PRIMARY KEY,
  proposition_id INTEGER NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_edited TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  argument_text TEXT
);

CREATE TABLE argument_quotation (
  argument_id INTEGER NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  PRIMARY KEY (argument_id, quotation_id)
);

CREATE TABLE argument_proposition (
  argument_id INTEGER NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  proposition_id INTEGER NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  PRIMARY KEY (argument_id, proposition_id)
);

COMMIT;


