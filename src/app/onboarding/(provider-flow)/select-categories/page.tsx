import { getCategoriesDAL } from "@/lib/dal/onboarding/categories";
import { CategoriesWrapper } from "./categories-wrapper";

export default async function ProviderOnboardingSelectCategoriesPage() {
  const categoriesResult = await getCategoriesDAL();

  if (!categoriesResult.success) {
    return (
      <CategoriesWrapper
        categories={{ success: false, error: categoriesResult.error }}
      />
    );
  }

  return <CategoriesWrapper categories={categoriesResult.data || []} />;
}
