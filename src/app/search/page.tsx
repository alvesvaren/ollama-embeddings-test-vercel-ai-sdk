import { search } from "../actions";
import SearchUI from "./SearchUI";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const { results = [] } = query ? await search(query) : { results: [] };

  return <SearchUI query={query} results={results} />;
}
