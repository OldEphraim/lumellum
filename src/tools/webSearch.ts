interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export async function webSearch(query: string): Promise<string> {
  const apiKey = process.env["TAVILY_API_KEY"];
  if (!apiKey) {
    return "Search unavailable.";
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 3 }),
    });

    if (!res.ok) {
      return `Search failed: ${res.status}`;
    }

    const data = (await res.json()) as { results: TavilyResult[] };
    const results = data.results;

    if (!results || results.length === 0) {
      return "No results found.";
    }

    return results
      .map(
        (r: TavilyResult, i: number) =>
          `${i + 1}. [${r.title}](${r.url})\n   ${r.content}`
      )
      .join("\n\n");
  } catch {
    return "Search unavailable.";
  }
}
