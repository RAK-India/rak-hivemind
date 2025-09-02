import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/search/SearchBar";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroups, getSubsectionsByGroup, getPopularArticles, getRecentArticles } from "@/lib/api/mock-api";
import { Group } from "@/lib/types/content";

export default function Landing() {
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups
  });

  const { data: departmentSubs, isLoading: deptLoading } = useQuery({
    queryKey: ['subsections', 'departments'],
    queryFn: () => getSubsectionsByGroup('departments')
  });

  const { data: resourceSubs, isLoading: resourceLoading } = useQuery({
    queryKey: ['subsections', 'resource-centre'],
    queryFn: () => getSubsectionsByGroup('resource-centre')
  });

  const { data: toolSubs, isLoading: toolsLoading } = useQuery({
    queryKey: ['subsections', 'tools'],
    queryFn: () => getSubsectionsByGroup('tools')
  });

  const { data: popularArticles, isLoading: popularLoading } = useQuery({
    queryKey: ['articles', 'popular'],
    queryFn: () => getPopularArticles(6)
  });

  const { data: recentArticles, isLoading: recentLoading } = useQuery({
    queryKey: ['articles', 'recent'],
    queryFn: () => getRecentArticles(6)
  });

  const renderCategorySection = (
    title: string,
    description: string,
    group: Group,
    subsections: any[] | undefined,
    loading: boolean
  ) => (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : (
          subsections?.map((subsection) => (
            <CategoryCard
              key={subsection.id}
              title={subsection.title}
              description={subsection.description}
              group={group}
              subsection={subsection}
              articleCount={subsection.articleCount}
              updatedAt={subsection.updatedAt}
              href={`/category/${group}/${subsection.slug}`}
            />
          ))
        )}
      </div>
    </section>
  );

  const renderArticleSection = (
    title: string,
    description: string,
    articles: any[] | undefined,
    loading: boolean
  ) => (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))
        ) : (
          articles?.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              showGroup={true}
            />
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="landing" />
      
      <main className="container max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              RAKwireless Knowledge Hub
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your comprehensive resource for documentation, guides, and technical knowledge.
              Search across departments, tools, and resources to find what you need.
            </p>
          </div>
          
          <SearchBar variant="hero" />
        </section>

        {/* Category Sections */}
        {renderCategorySection(
          "Departments",
          "Resources organized by department and team functions",
          "departments",
          departmentSubs,
          deptLoading
        )}

        {renderCategorySection(
          "Resource Centre",
          "Comprehensive knowledge base and documentation",
          "resource-centre",
          resourceSubs,
          resourceLoading
        )}

        {renderCategorySection(
          "Tools",
          "Development tools, utilities, and platform guides",
          "tools",
          toolSubs,
          toolsLoading
        )}

        {/* Dynamic Content Sections */}
        {renderArticleSection(
          "Popular Articles",
          "Most viewed content across all categories",
          popularArticles,
          popularLoading
        )}

        {renderArticleSection(
          "Recently Updated",
          "Latest updates and new content",
          recentArticles,
          recentLoading
        )}
      </main>
    </div>
  );
}