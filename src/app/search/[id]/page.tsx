import { search } from "../../actions";
import SearchUI from "./SearchUI";

export default async function SearchPage({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string; searchType?: "content" | "summary" }>;
}) {
  const { id } = await params;
  const { query, searchType = "content" } = await searchParams;
  const { results = [] } = query ? await search(query, id, searchType) : { results: [] };

  return <SearchUI query={query} results={results} searchType={searchType} />;
}
