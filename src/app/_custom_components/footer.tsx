export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-2"></div>
        <p className="text-center text-sm/6 text-muted-foreground md:order-1 md:mt-0">
          &copy; {new Date().getUTCFullYear()} Tidy Elephant, LLC
        </p>
      </div>
    </footer>
  );
}
