import AboutUs from "./_custom_components/about-us";
import Benefits from "./_custom_components/benefits";
import FAQ from "./_custom_components/faq";
import HeroPage from "./_custom_components/hero";
import SubscribeToLaunch from "./_custom_components/subscribe";

export default function LandingPage() {
  return (
    <>
      <HeroPage />
      <SubscribeToLaunch />
      <Benefits />
      <AboutUs />
      <FAQ />
    </>
  );
}
