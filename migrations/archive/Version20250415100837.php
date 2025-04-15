<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250415100837 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creating the Article table manually';
    }

    public function up(Schema $schema): void
    {
        // Manually added SQL to create the Article table
        $this->addSql('CREATE SEQUENCE article_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE article (
            id INT NOT NULL DEFAULT nextval(\'article_id_seq\'),
            title VARCHAR(255) NOT NULL,
            content TEXT DEFAULT NULL,
            PRIMARY KEY(id)
        )');
    }

    public function down(Schema $schema): void
    {
        // Drop the Article table when rolling back
        $this->addSql('DROP TABLE article');
        $this->addSql('DROP SEQUENCE article_id_seq');
        
        // This was in the original file
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
    }
}
