import AboutCard from "@/components/new-layout/About/AboutCard";
import BrandsCard from "@/components/new-layout/About/BrandsCard";
// import FeaturesCard from "@/components/new-layout/About/FeaturesCard";
import TeamCard from "@/components/new-layout/About/TeamCard";
import CTASection from "@/components/new-layout/Homepage/CTASection";
import FeaturesSection from "@/components/new-layout/Homepage/FeaturesSection";
import Reviews from "@/components/new-layout/Homepage/Reviews";
import PageHeader from "@/components/new-layout/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerBooster.AI-About",
  description:
    "Elevate your career with CareerBooster.AI – Your go-to destination for AI-powered tools that transform your professional image. In today's competitive job market, trust our expertise in crafting ATS-friendly resumes and captivating executive resumes. Join over 20,000 professionals who've revolutionized their job hunt with CareerBooster.",
  keywords: [
    "CareerBooster.AI",
    "AI-powered tools",
    "ATS-friendly resumes",
    "Executive resumes",
    "Professional image",
    "Competitive job market",
    "Job hunt transformation",
    "Career advancement",
    "20,000+ professionals",
    "Revolutionize job search",
    "CareerBooster About ",
    "About CareerBooster",
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function AboutPage() {
  return (
    <main className="flex-grow-1 mb-20">
      {/* <!-- Page header --> */}
      <PageHeader title="About CareerBooster.AI" secondTitle="About us" />

      {/* About Card */}
      <AboutCard />

      {/* Features Section */}
      <FeaturesSection />

      {/* Team */}
      <TeamCard />

      {/* Reviews */}
      <Reviews />

      {/* Brands */}
      <BrandsCard />

      {/*<!-- CTA --> */}
      <CTASection />
    </main>
  );
}
