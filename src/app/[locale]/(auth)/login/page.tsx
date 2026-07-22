import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
