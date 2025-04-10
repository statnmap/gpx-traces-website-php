<?php
namespace App\DataFixtures;

use App\Entity\Article;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ArticleFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $article1 = new Article();
        $article1->setTitle('Hello World');
        $article1->setContent('This is the first blog post!');
        $manager->persist($article1);

        $article2 = new Article();
        $article2->setTitle('Another Post');
        $article2->setContent('This is another example of a blog post.');
        $manager->persist($article2);

        $manager->flush();
    }
}