export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">401 - Unauthorized</h1>
            <p className="text-gray-600 mb-8 text-center max-w-md">
                You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.
            </p>
            <a
                href="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Return to Login
            </a>
        </div>
    );
}
