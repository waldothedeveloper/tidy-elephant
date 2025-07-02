import AboutUs from "./_custom_components/about-us";
import Benefits2 from "./_custom_components/benefits-2";
import FAQ from "./_custom_components/faq";
import Filler from "./_custom_components/filler";
import Footer from "./_custom_components/footer";
import HeroPage from "./_custom_components/hero";
import SubscribeToLaunch from "./_custom_components/subscribe";

export default function LandingPage() {
  return (
    <>
      <HeroPage />
      <SubscribeToLaunch />
      <Benefits2 />
      <SubscribeToLaunch />
      <AboutUs />
      <FAQ />
      <Filler />
      <SubscribeToLaunch />
      <Footer />
    </>
  );
}
