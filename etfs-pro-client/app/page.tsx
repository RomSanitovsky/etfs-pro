import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <div className="h-screen relative overflow-hidden">
      <StarField />
      <Header />
      <Hero />
    </div>
  );
}
