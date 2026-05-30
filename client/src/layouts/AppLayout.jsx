import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            <Footer />
        </div>
    );
}