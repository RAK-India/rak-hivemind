import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, Eye, Calendar, Share, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { KnowledgeLayout } from "./KnowledgeLayout";
import { getArticle, getRelatedArticles } from "@/lib/api/mock-api";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => slug ? getArticle(slug) : Promise.resolve(null),
    enabled: !!slug
  });

  const { data: relatedArticles, isLoading: relatedLoading } = useQuery({
    queryKey: ['related', article?.id],
    queryFn: () => article ? getRelatedArticles(article.tags.map(t => t.id), article.slug) : Promise.resolve([]),
    enabled: !!article
  });

  if (!slug) {
    return (
      <KnowledgeLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground">The requested article does not exist.</p>
        </div>
      </KnowledgeLayout>
    );
  }

  if (articleLoading) {
    return (
      <KnowledgeLayout>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </KnowledgeLayout>
    );
  }

  if (!article) {
    return (
      <KnowledgeLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground">The requested article does not exist.</p>
        </div>
      </KnowledgeLayout>
    );
  }

  const groupLabels = {
    departments: 'Departments',
    'resource-centre': 'Resource Centre',
    tools: 'Tools'
  };

  const breadcrumbs = [
    { label: groupLabels[article.group], href: `/category/${article.group}` },
    { label: article.subsection, href: `/category/${article.group}/${article.subsection}` },
    { label: article.title }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <KnowledgeLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDate(article.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.readMinutes} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.views.toLocaleString()} views</span>
            </div>
            {article.author && (
              <span>By {article.author}</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </header>

        <Separator className="mb-8" />

        {/* Article Content */}
        <article className="prose prose-gray dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.html }} />
        </article>

        <Separator className="mb-8" />

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            
            {relatedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    article={relatedArticle}
                    showGroup={true}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </KnowledgeLayout>
  );
}