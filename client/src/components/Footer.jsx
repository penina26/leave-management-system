export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 shadow-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                <p>© {new Date().getFullYear()} Leave Management System. All rights reserved.</p>
                <p className="mt-2 md:mt-0">Built for staff leave and user management</p>
            </div>
        </footer>
    );
}