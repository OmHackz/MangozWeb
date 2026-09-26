import type { Metadata } from "next";
import LoginForm from "./login-form";
import { PageHeader } from "@/components/Headers";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-10">
      <PageHeader title="Login" description="Accounts arrive with the next update. Join the Discord meanwhile." />
      <LoginForm />
    </div>
  );
}
