import AboutUs from "./_custom_components/about-us";
import Benefits2 from "./_custom_components/benefits-2";
import FAQ from "./_custom_components/faq";
import Filler from "./_custom_components/filler";
import HeroPage from "./_custom_components/hero";
// import SubscribeCTA from "./_custom_components/subscribe-cta";

export default function LandingPage() {
  return (
    <>
      <HeroPage />
      {/* <SubscribeCTA /> */}
      <Benefits2 />
      <Filler />
      {/* <SubscribeCTA /> */}
      <AboutUs />
      <FAQ />
    </>
  );
}
