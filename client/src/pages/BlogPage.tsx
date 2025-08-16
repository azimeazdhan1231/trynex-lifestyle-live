import Layout from "@/components/Layout";
import BlogGrid from "@/components/BlogGrid";

const BlogPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ব্লগ</h1>
        <BlogGrid />
      </div>
    </Layout>
  );
};

export default BlogPage;