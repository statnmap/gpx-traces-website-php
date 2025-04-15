<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250415143710 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Consolidated migration that creates the full database schema';
    }

    public function up(Schema $schema): void
    {
        // Create the article table and sequence
        $this->addSql('CREATE SEQUENCE article_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE article (
            id INT NOT NULL DEFAULT nextval(\'article_id_seq\'),
            title VARCHAR(255) NOT NULL,
            content TEXT DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        
        // Add any other tables your application needs here
    }

    public function down(Schema $schema): void
    {
        // Drop tables in reverse order of creation to respect foreign keys
        $this->addSql('DROP TABLE article');
        $this->addSql('DROP SEQUENCE article_id_seq');
    }

    public function isTransactional(): bool
    {
        return false;
    }
}
