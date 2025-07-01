import { Disclosure } from "@headlessui/react";
import { Flower } from "lucide-react";

export default function Navigation() {
  return (
    <Disclosure as="nav">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Flower className="h-8 w-auto text-primary" />

              <p className="text-foreground text-sm ml-1 font-semibold">
                Ease & Arrange
              </p>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
