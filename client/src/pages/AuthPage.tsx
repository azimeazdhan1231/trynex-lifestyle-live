import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";

const AuthPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;