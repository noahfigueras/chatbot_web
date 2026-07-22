import SignUpForm from "@/components/auth/SignUpForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <SignUpForm />
      </main>
      <Footer />
    </>
  );
}
