import { LoginForm } from "@/components/login-page/login-form";
import { Navbar } from "@/components/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="flex w-full items-center justify-center p-6 ">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
