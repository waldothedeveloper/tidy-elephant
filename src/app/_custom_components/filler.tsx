import Image from "next/image";

export default function Filler() {
  return (
    <div className="bg-white">
      <div className="relative bg-foreground">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <Image
            fill
            alt="decluttered room with a bed, window and plants"
            src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="size-full object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900 opacity-50"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center sm:py-64 lg:px-0">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
            The stress-free way to transform your space is coming.
          </h1>
          <p className="mt-4 text-xl text-white">
            Connect with a curated community of professional declutterers,
            organizers and cleaners in your area ready to help you transform
            your space. <br /> Launching soon.
          </p>
        </div>
      </div>
    </div>
  );
}
