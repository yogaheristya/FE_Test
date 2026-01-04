import Navbar from "../components/Navbar.tsx";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="p-6">{children}</main>
    </>
  );
}
