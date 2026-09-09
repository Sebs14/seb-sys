import { PortfolioProvider } from "@/components/portfolio/portfolio-state";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { Hero } from "@/components/portfolio/hero";
import { FeaturedCases } from "@/components/portfolio/project-case";
import { ProjectList } from "@/components/portfolio/project-list";
import { Approach } from "@/components/portfolio/approach";
import { Experience } from "@/components/portfolio/experience";
import { Playground } from "@/components/portfolio/playground";
import { Contact, SiteFooter } from "@/components/portfolio/contact";

/* La página es un Server Component que compone secciones cliente. El
   HTML inicial ya trae nombre, presentación, proyectos y contacto; la
   GPU llega después y no mueve nada. */
export default function Home() {
  return (
    <PortfolioProvider>
      <PortfolioNav />
      <main id="main">
        <Hero />
        <FeaturedCases />
        <ProjectList />
        <Approach />
        <Experience />
        <Playground />
        <Contact />
      </main>
      <SiteFooter />
    </PortfolioProvider>
  );
}
