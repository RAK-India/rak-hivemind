import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search/SearchBar";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KnowledgeLayout } from "./KnowledgeLayout";
import { searchContent, getAllTags } from "@/lib/api/mock-api";
import { SearchMode, SearchFilters, Group } from "@/lib/types/content";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    mode: (searchParams.get('mode') as SearchMode) || 'all',
    tags: searchParams.getAll('tags'),
    groups: searchParams.getAll('groups') as Group[],
    sort: (searchParams.get('sort') as 'relevance' | 'date' | 'views') || 'relevance'
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => searchContent(filters),
    enabled: true
  });

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    params.set('mode', filters.mode);
    filters.tags.forEach(tag => params.append('tags', tag));
    filters.groups.forEach(group => params.append('groups', group));
    if (filters.sort !== 'relevance') params.set('sort', filters.sort);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (query: string, mode: SearchMode) => {
    setFilters(prev => ({ ...prev, query, mode }));
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort: sort as 'relevance' | 'date' | 'views' }));
  };

  const toggleTag = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const toggleGroup = (group: Group) => {
    setFilters(prev => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter(g => g !== group)
        : [...prev.groups, group]
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      tags: [],
      groups: []
    }));
  };

  const groupedResults = searchResults?.reduce((acc, result) => {
    const key = result.matchType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<string, typeof searchResults>);

  const breadcrumbs = [
    { label: "Search Results" }
  ];

  return (
    <KnowledgeLayout breadcrumbs={breadcrumbs}>
      <div>
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Search</h1>
          <SearchBar
            variant="compact"
            defaultMode={filters.mode}
            defaultQuery={filters.query}
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Sort by</h3>
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Recently Updated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Categories</h3>
              <div className="space-y-2">
                {(['departments', 'resource-centre', 'tools'] as Group[]).map((group) => (
                  <Button
                    key={group}
                    variant={filters.groups.includes(group) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGroup(group)}
                    className="w-full justify-start"
                  >
                    {group === 'resource-centre' ? 'Resource Centre' : 
                     group.charAt(0).toUpperCase() + group.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {allTags && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Tags</h3>
                  {(filters.tags.length > 0 || filters.groups.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={filters.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {searchLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-8">
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {searchResults.length} results found
                    {filters.query && ` for "${filters.query}"`}
                  </p>
                </div>

                {/* Grouped Results */}
                {groupedResults && Object.entries(groupedResults).map(([matchType, results]) => (
                  <div key={matchType}>
                    {filters.mode === 'all' && (
                      <h2 className="text-lg font-semibold text-foreground mb-4 capitalize">
                        {matchType} Matches ({results.length})
                      </h2>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.map((result) => (
                        <div key={`${result.type}-${result.item.id}`}>
                          {result.type === 'article' ? (
                            <ArticleCard 
                              article={result.item as any} 
                              showGroup={true}
                            />
                          ) : (
                            <CategoryCard
                              title={result.item.title}
                              description={(result.item as any).description || (result.item as any).excerpt || ''}
                              subsection={result.item as any}
                              articleCount={(result.item as any).articleCount}
                              updatedAt={result.item.updatedAt}
                              href={`/category/${(result.item as any).group}/${(result.item as any).slug}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters
                </p>
                {allTags && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">Popular tags:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {allTags.slice(0, 6).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/20"
                          onClick={() => setFilters(prev => ({ ...prev, tags: [tag.id], query: '' }))}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </KnowledgeLayout>
  );
}