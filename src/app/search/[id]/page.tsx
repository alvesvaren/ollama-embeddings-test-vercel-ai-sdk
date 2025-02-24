import { search } from "../../actions";
import SearchUI from "./SearchUI";

export default async function SearchPage({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { id } = await params;
  const { query } = await searchParams;
  const { results = [] } = query ? await search(query, id) : { results: [] };

  return <SearchUI query={query} results={results} />;
}
