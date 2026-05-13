

CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_name TEXT NOT NULL,
    expiration_date TEXT,
    status TEXT,
    last_renewed TEXT,
    auto_renew INTEGER
    certificate_type TEXT,
    renewal_stage TEXT
);

CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_id INTEGER,
    message TEXT,
    timestamp TEXT,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);
