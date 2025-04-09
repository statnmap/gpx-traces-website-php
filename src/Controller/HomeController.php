<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Article;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class HomeController extends AbstractController
{
    #[Route("/", name: "home")]
    public function index(EntityManagerInterface $entityManager): Response
    {
        // Fetch the first blog post
        $blogPost = $entityManager->getRepository(Article::class)->findOneBy([]);

        if (!$blogPost) {
            return new Response('<html><body><h1>No blog posts available</h1></body></html>');
        }

        return new Response(
            '<html><body>' .
            '<h1>HELLO</h1>' .
            '<h1>' . htmlspecialchars($blogPost->getTitle()) . '</h1>' .
            '<p>' . nl2br(htmlspecialchars($blogPost->getContent())) . '</p>' .
            '</body></html>'
        );
    }
}