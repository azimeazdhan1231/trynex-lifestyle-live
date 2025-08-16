import Layout from "@/components/Layout";
import SearchResults from "@/components/SearchResults";
import { useLocation } from "wouter";

const SearchPage = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {query ? `"${query}" এর জন্য খোঁজার ফলাফল` : 'অনুসন্ধান'}
        </h1>
        <SearchResults query={query} />
      </div>
    </Layout>
  );
};

export default SearchPage;