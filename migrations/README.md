DB migration notes

Add the following fields to your invoices table to support PDF tracking. If you maintain migrations in a separate system, apply an equivalent migration there.

SQL example:

ALTER TABLE invoices
  ADD COLUMN pdf_url TEXT,
  ADD COLUMN pdf_generated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN pdf_generation_error TEXT;

If your project uses a migration tool (e.g., knex, sequelize), create a migration that applies the SQL above and a rollback that drops these columns.
