export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0">
          &copy; {new Date().getUTCFullYear()} Ease & Arrange, LLC.
        </p>
      </div>
    </footer>
  );
}
