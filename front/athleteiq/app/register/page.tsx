import { RegistrationForm } from "@/components/registration/registration-form";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 overflow-hidden"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl text-pink-400">
        Athlete Registration
      </h1>
      <RegistrationForm />
    </main>
  );
}
