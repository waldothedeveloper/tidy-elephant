import { CategoriesWrapper } from "./categories-wrapper";
import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { getFirebaseProviderCategoriesDAL } from "@/lib/dal";
import { getFirestore } from "firebase/firestore";
export default async function ProviderOnboardingSelectCategoriesPage() {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const db = getFirestore(firebaseServerApp);

  const fetchedCategories = await getFirebaseProviderCategoriesDAL(db);

  return <CategoriesWrapper categories={fetchedCategories} />;
}
