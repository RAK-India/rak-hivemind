import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { KnowledgeLayout } from "./KnowledgeLayout";
import { getSubsectionsByGroup, getSubsection, getArticlesBySubsection } from "@/lib/api/mock-api";
import { Group } from "@/lib/types/content";

const groupInfo = {
  departments: {
    title: "Departments",
    description: "Resources organized by department and team functions"
  },
  "resource-centre": {
    title: "Resource Centre", 
    description: "Comprehensive knowledge base and documentation"
  },
  tools: {
    title: "Tools",
    description: "Development tools, utilities, and platform guides"
  }
};

export default function CategoryPage() {
  const { group, subsection } = useParams<{ group: Group; subsection?: string }>();
  
  const { data: subsections, isLoading: subsectionsLoading } = useQuery({
    queryKey: ['subsections', group],
    queryFn: () => group ? getSubsectionsByGroup(group) : Promise.resolve([]),
    enabled: !!group && !subsection
  });

  const { data: currentSubsection, isLoading: subsectionLoading } = useQuery({
    queryKey: ['subsection', subsection],
    queryFn: () => subsection ? getSubsection(subsection) : Promise.resolve(null),
    enabled: !!subsection
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', subsection],
    queryFn: () => subsection ? getArticlesBySubsection(subsection) : Promise.resolve([]),
    enabled: !!subsection
  });

  if (!group || !(group in groupInfo)) {
    return (
      <KnowledgeLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">The requested category does not exist.</p>
        </div>
      </KnowledgeLayout>
    );
  }

  const info = groupInfo[group];
  
  // Breadcrumbs
  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: info.title, href: subsection ? `/category/${group}` : undefined }
  ];
  
  if (subsection && currentSubsection) {
    breadcrumbs.push({ label: currentSubsection.title });
  }

  // Subsection view (show articles)
  if (subsection) {
    return (
      <KnowledgeLayout breadcrumbs={breadcrumbs}>
        <div>
          {subsectionLoading ? (
            <div className="space-y-4 mb-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ) : currentSubsection ? (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {currentSubsection.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {currentSubsection.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSubsection.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">Subsection Not Found</h1>
              <p className="text-muted-foreground">The requested subsection does not exist.</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Articles</h2>
            
            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No articles found in this section.</p>
              </div>
            )}
          </div>
        </div>
      </KnowledgeLayout>
    );
  }

  // Group view (show subsections)
  return (
    <KnowledgeLayout breadcrumbs={breadcrumbs}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{info.title}</h1>
          <p className="text-lg text-muted-foreground">{info.description}</p>
        </div>

        {subsectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : subsections && subsections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subsections.map((subsection) => (
              <CategoryCard
                key={subsection.id}
                title={subsection.title}
                description={subsection.description}
                subsection={subsection}
                articleCount={subsection.articleCount}
                updatedAt={subsection.updatedAt}
                href={`/category/${group}/${subsection.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No subsections found in this category.</p>
          </div>
        )}
      </div>
    </KnowledgeLayout>
  );
}