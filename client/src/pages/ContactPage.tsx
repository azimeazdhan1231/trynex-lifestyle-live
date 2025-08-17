import Layout from "@/components/Layout";
import ContactForm from "@/components/ContactForm";
// ContactInfo component removed - import was causing build error

const ContactPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">যোগাযোগ করুন</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactForm />
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;